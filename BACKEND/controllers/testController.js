const Test = require('../models/Test');
const Question = require('../models/Question');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { generateQuestions } = require('../services/questionGenerator');
const { sendNotification } = require('../services/notificationService');

// Helper: Format Mongoose Question object to frontend format
const formatQuestionForClient = (q) => {
  const base = {
    id: q._id,
    type: q.type,
    question: q.questionText,
    marks: q.maxMarks,
    topic: q.topic,
    difficulty: q.difficulty,
  };

  if (q.type === 'mcq') {
    // Map options object to array
    const opts = q.options || {};
    base.options = [opts.A || '', opts.B || '', opts.C || '', opts.D || ''];
    // Map correctAnswer string (A, B, C, D) to index (0, 1, 2, 3)
    const map = { A: 0, B: 1, C: 2, D: 3 };
    base.correctOption = map[q.correctAnswer] !== undefined ? map[q.correctAnswer] : 0;
    base.explanation = q.explanation || '';
  } else if (q.type === 'short' || q.type === 'long') {
    base.modelAnswer = q.modelAnswer;
  } else if (q.type === 'scenario') {
    base.scenarioText = q.questionText;
    base.subQuestions = (q.subQuestions || []).map((sub, idx) => {
      const subFormatted = {
        id: `${q._id}_${idx}`, // Create unique sub-id
        type: sub.type,
        question: sub.questionText,
        marks: sub.maxMarks,
        modelAnswer: sub.modelAnswer,
        explanation: sub.explanation
      };
      if (sub.type === 'mcq') {
        const subOpts = sub.options || {};
        subFormatted.options = [subOpts.A || '', subOpts.B || '', subOpts.C || '', subOpts.D || ''];
        const map = { A: 0, B: 1, C: 2, D: 3 };
        subFormatted.correctOption = map[sub.correctAnswer] !== undefined ? map[sub.correctAnswer] : 0;
      }
      return subFormatted;
    });
  }

  return base;
};

/**
 * @desc    Generate a new practice test from Document
 * @route   POST /api/tests/generate
 * @access  Private
 */
const generateTest = async (req, res, next) => {
  try {
    const { documentId, subject, difficulty, mcqCount, shortCount, longCount, scenarioCount } = req.body;

    let document = null;
    let docSubject = subject || 'General';
    let docName = 'General Knowledge Manual';
    let contextText = '';

    if (documentId) {
      document = await Document.findOne({ _id: documentId, user: req.user.id });
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      docSubject = document.subject;
      docName = document.originalName;
      
      // Query document chunks, sort by chunkIndex
      const chunks = await DocumentChunk.find({ document: documentId }).sort({ chunkIndex: 1 });
      if (chunks.length > 0) {
        let selectedChunks = [];
        if (chunks.length <= 15) {
          selectedChunks = chunks;
        } else {
          // Select 15 chunks evenly distributed across the document
          const step = chunks.length / 15;
          for (let i = 0; i < 15; i++) {
            const idx = Math.floor(i * step);
            selectedChunks.push(chunks[idx]);
          }
        }
        contextText = selectedChunks.map(c => c.text).join('\n\n---\n\n');
      } else {
        // Fallback to full extracted text if chunks are not indexed yet
        contextText = document.extractedText || '';
      }
    } else {
      docSubject = subject || 'General';
      docName = `Manual Topic: ${docSubject}`;
    }

    // Call Gemini question generator service
    const questionsData = await generateQuestions(
      contextText,
      docSubject,
      difficulty || 'Medium',
      {
        mcqCount: Number(mcqCount) || 0,
        shortCount: Number(shortCount) || 0,
        longCount: Number(longCount) || 0,
        scenarioCount: Number(scenarioCount) || 0
      }
    );

    // Build Mongoose Test Document
    const test = await Test.create({
      user: req.user.id,
      document: documentId || null,
      title: `Practice Exam: ${docSubject}`,
      subject: docSubject,
      difficulty: (difficulty || 'medium').toLowerCase(),
      config: {
        mcqCount: Number(mcqCount) || 0,
        shortCount: Number(shortCount) || 0,
        longCount: Number(longCount) || 0,
        scenarioCount: Number(scenarioCount) || 0,
      },
      status: 'ready'
    });

    let totalMarks = 0;
    const questionsList = [];

    // Save generated questions to DB
    for (const q of questionsData) {
      const dbQ = await Question.create({
        test: test._id,
        document: documentId || null,
        type: q.type,
        questionText: q.questionText,
        options: q.options || {},
        correctAnswer: q.correctAnswer || '',
        maxMarks: q.maxMarks || 2,
        difficulty: (difficulty || 'medium').toLowerCase(),
        topic: q.topic || 'General Concepts',
        explanation: q.explanation || '',
        modelAnswer: q.modelAnswer || '',
        subQuestions: q.subQuestions || []
      });

      if (q.type === 'scenario') {
        const scenarioMarks = (q.subQuestions || []).reduce((sum, sub) => sum + (sub.maxMarks || 0), 0);
        dbQ.maxMarks = scenarioMarks;
        await dbQ.save();
        totalMarks += scenarioMarks;
      } else {
        totalMarks += q.maxMarks || 2;
      }
      questionsList.push(dbQ);
    }

    // Calculate duration: 2 mins per MCQ, 5 mins per short, 10 mins per long/scenario
    const duration = (Number(mcqCount) * 2) + (Number(shortCount) * 5) + (Number(longCount) * 10) + (Number(scenarioCount) * 12) || 45;

    test.totalMarks = totalMarks;
    test.durationMinutes = duration;
    await test.save();

    // Send real-time notification
    await sendNotification(req.user.id, {
      text: `Your practice test on "${docSubject}" (${difficulty || 'Medium'}) has been generated.`,
      type: 'info',
    });

    // Map questions to categories for response
    const clientMcqs = questionsList.filter(q => q.type === 'mcq').map(formatQuestionForClient);
    const clientShorts = questionsList.filter(q => q.type === 'short').map(formatQuestionForClient);
    const clientLongs = questionsList.filter(q => q.type === 'long').map(formatQuestionForClient);
    const clientScenarios = questionsList.filter(q => q.type === 'scenario').map(formatQuestionForClient);

    res.status(201).json({
      success: true,
      message: 'Test compiled successfully by ExamGen AI engine',
      test: {
        _id: test._id,
        documentId: test.document || null,
        documentName: docName,
        subject: test.subject,
        difficulty: test.difficulty,
        duration: test.durationMinutes,
        questions: {
          mcq: clientMcqs,
          short: clientShorts,
          long: clientLongs,
          scenario: clientScenarios
        },
        createdAt: test.createdAt
      }
    });
  } catch (error) {
    // Return friendly error response instead of 500 crashes
    res.status(400).json({
      success: false,
      message: error.message || 'Error occurred during AI question generation.'
    });
  }
};

/**
 * @desc    Get all tests for logged-in user
 * @route   GET /api/tests
 * @access  Private
 */
const getTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ user: req.user.id })
      .populate('document', 'originalName')
      .sort({ createdAt: -1 });

    const formattedTests = tests.map(t => ({
      _id: t._id,
      documentId: t.document ? t.document._id : null,
      documentName: t.document ? t.document.originalName : 'General Knowledge Base',
      subject: t.subject,
      difficulty: t.difficulty,
      duration: t.durationMinutes,
      status: t.status,
      createdAt: t.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedTests.length,
      tests: formattedTests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single test by ID
 * @route   GET /api/tests/:id
 * @access  Private
 */
const getTest = async (req, res, next) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, user: req.user.id })
      .populate('document', 'originalName');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const questions = await Question.find({ test: test._id }).sort({ createdAt: 1 });

    const clientMcqs = questions.filter(q => q.type === 'mcq').map(formatQuestionForClient);
    const clientShorts = questions.filter(q => q.type === 'short').map(formatQuestionForClient);
    const clientLongs = questions.filter(q => q.type === 'long').map(formatQuestionForClient);
    const clientScenarios = questions.filter(q => q.type === 'scenario').map(formatQuestionForClient);

    res.status(200).json({
      success: true,
      test: {
        _id: test._id,
        documentId: test.document ? test.document._id : null,
        documentName: test.document ? test.document.originalName : 'General Knowledge Base',
        subject: test.subject,
        difficulty: test.difficulty,
        duration: test.durationMinutes,
        status: test.status,
        questions: {
          mcq: clientMcqs,
          short: clientShorts,
          long: clientLongs,
          scenario: clientScenarios
        },
        createdAt: test.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateTest, getTests, getTest };
