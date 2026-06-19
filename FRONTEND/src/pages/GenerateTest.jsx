import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Sparkles, AlertCircle, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import documentService from '../services/documentService';
import testService from '../services/testService';

const GenerateTest = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Form Fields
  const [selectedDocId, setSelectedDocId] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [mcqCount, setMcqCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [scenarioCount, setScenarioCount] = useState(1);

  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [error, setError] = useState(null);
  const [generatedTest, setGeneratedTest] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await documentService.getDocuments();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDocId(data.documents[0]._id);
          setSubject(data.documents[0].subject);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Update subject input when document selection changes
  const handleDocChange = (docId) => {
    setSelectedDocId(docId);
    const selectedDoc = documents.find(d => d._id === docId);
    if (selectedDoc) {
      setSubject(selectedDoc.subject);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject) {
      setError('Please specify a subject domain.');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedTest(null);

    // Simulate RAG pipeline processing steps
    const steps = [
      'Locating document nodes in vector database...',
      'Retrieving relevant topic summaries...',
      'Synthesizing contextual evaluation criteria...',
      'Compiling MCQ statements and distractors...',
      'Formulating scenario narratives and grading rubrics...',
      'AI Question Compilation complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationProgress(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const data = await testService.generateTest({
        documentId: selectedDocId || null,
        subject,
        difficulty,
        mcqCount: Number(mcqCount),
        shortCount: Number(shortCount),
        longCount: Number(longCount),
        scenarioCount: Number(scenarioCount)
      });

      if (data.success) {
        setGeneratedTest(data.test);
      } else {
        setError(data.message || 'Generation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error compiling test. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-md mx-auto py-12 px-4 text-center">
        <div className="glass-panel border border-brand-border/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-brand-warning"></div>
          
          <div className="mx-auto p-4 rounded-full bg-brand-warning/10 border border-brand-warning/20 text-brand-warning shadow-glow w-16 h-16 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-brand-textPrimary tracking-tight">
              Test Generator Disabled on Mobile
            </h2>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              AI Test Generation is disabled on mobile devices because the screen size is too small for configuring complex parameters and taking exams. 
              Please switch to a desktop or tablet for the optimal workspace experience.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-brand-darkBg hover:bg-brand-cardBg border border-brand-border/40 hover:text-brand-textPrimary text-xs font-bold text-brand-textSecondary rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (docsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <PageHeader 
        title="AI Test Generator" 
        subtitle="Extract knowledge from your documents to compile personalized exams." 
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="py-2 px-4 rounded-xl border border-brand-border/40 text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 transition-all cursor-pointer animate-fadeIn"
        >
          Return to Dashboard
        </button>
      </PageHeader>

      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!generatedTest && !generating ? (
        /* Configuration Form */
        <form onSubmit={handleGenerate} className="glass-panel border border-brand-border/40 rounded-2xl p-6 md:p-8 space-y-6 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent"></div>

          {/* Document Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Source Material
            </label>
            {documents.length === 0 ? (
              <div className="p-4 rounded-xl border border-brand-border/40 bg-brand-darkBg/30 text-xs text-brand-textSecondary flex justify-between items-center">
                <span>No PDF uploaded yet. Standard general test templates will be generated.</span>
                <span onClick={() => navigate('/upload-pdf')} className="text-brand-accent cursor-pointer hover:underline">Upload PDF</span>
              </div>
            ) : (
              <select
                value={selectedDocId}
                onChange={(e) => handleDocChange(e.target.value)}
                className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all"
              >
                <option value="">-- Manual Topic Input --</option>
                {documents.map(d => (
                  <option key={d._id} value={d._id}>{d.originalName} ({d.subject})</option>
                ))}
              </select>
            )}
          </div>

          {/* Subject & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
                Exam Subject Domain
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Core OOP Principles"
                className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-textPrimary shadow-glow'
                        : 'bg-brand-cardBg border-brand-border/30 text-brand-textSecondary hover:border-brand-primary/30 hover:text-brand-textPrimary'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Counts Grid */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Question Distribution
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-brand-darkBg border border-brand-border/30 space-y-2">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase block">Multiple Choice</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  className="w-full bg-brand-cardBg border border-brand-border/60 rounded-lg p-2 text-center text-sm text-brand-textPrimary focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-brand-darkBg border border-brand-border/30 space-y-2">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase block">Short Answer</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={shortCount}
                  onChange={(e) => setShortCount(e.target.value)}
                  className="w-full bg-brand-cardBg border border-brand-border/60 rounded-lg p-2 text-center text-sm text-brand-textPrimary focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-brand-darkBg border border-brand-border/30 space-y-2">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase block">Long Answer</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={longCount}
                  onChange={(e) => setLongCount(e.target.value)}
                  className="w-full bg-brand-cardBg border border-brand-border/60 rounded-lg p-2 text-center text-sm text-brand-textPrimary focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-brand-darkBg border border-brand-border/30 space-y-2">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase block">Scenario Based</span>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={scenarioCount}
                  onChange={(e) => setScenarioCount(e.target.value)}
                  className="w-full bg-brand-cardBg border border-brand-border/60 rounded-lg p-2 text-center text-sm text-brand-textPrimary focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-glow text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 hover:brightness-110 transition-all select-none cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
            <span>Generate Assessment</span>
          </button>
        </form>
      ) : generating ? (
        /* Processing Screen */
        <div className="glass-panel border border-brand-border/40 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6">
          <LoadingSpinner size="lg" color="accent" />
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider">Compiling AI Exam</h3>
            <p className="text-xs text-brand-accent font-mono animate-pulse">{generationProgress}</p>
          </div>
        </div>
      ) : (
        /* Summary Box */
        <div className="glass-panel border border-brand-border/60 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-scaleUp">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-success"></div>

          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-brand-border/10">
            <div className="p-3.5 rounded-full bg-brand-success/15 border border-brand-success/20 text-brand-success shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-textPrimary">Assessment Ready!</h2>
              <p className="text-xs text-brand-textSecondary">AI successfully formulated evaluation criteria matching your document.</p>
            </div>
          </div>

          {/* Assessment Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div className="p-3 bg-brand-darkBg border border-brand-border/20 rounded-xl">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase">Subject</span>
              <p className="text-xs font-bold text-brand-textPrimary mt-1 truncate">{generatedTest.subject}</p>
            </div>
            <div className="p-3 bg-brand-darkBg border border-brand-border/20 rounded-xl">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase">Difficulty</span>
              <p className="text-xs font-bold text-brand-accent mt-1">{generatedTest.difficulty}</p>
            </div>
            <div className="p-3 bg-brand-darkBg border border-brand-border/20 rounded-xl">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase">Duration</span>
              <p className="text-xs font-bold text-brand-textPrimary mt-1 font-mono">{generatedTest.duration} Minutes</p>
            </div>
            <div className="p-3 bg-brand-darkBg border border-brand-border/20 rounded-xl">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase">Structure</span>
              <p className="text-xs font-bold text-brand-textPrimary mt-1">
                {(generatedTest.questions.mcq?.length || 0)} MCQ | {(generatedTest.questions.short?.length || 0)} Short
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-brand-border/10">
            <button
              onClick={() => setGeneratedTest(null)}
              className="flex-1 py-3 px-4 bg-brand-darkBg border border-brand-border/40 text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Reconfigure
            </button>
            <button
              onClick={() => navigate(`/take-test/${generatedTest._id}`)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-glow text-xs font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <span>Attempt Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateTest;
