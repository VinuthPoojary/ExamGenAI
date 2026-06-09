const mongoose = require('mongoose');

/**
 * Question Schema
 * Stores AI-generated questions for a test
 * Supports MCQ, Short Answer, Long Answer, Scenario types
 */
const QuestionSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long', 'scenario'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    // MCQ specific fields
    options: {
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    correctAnswer: {
      type: String, // 'A', 'B', 'C', 'D' for MCQ, or full answer for others
      default: '',
    },
    // Marks
    maxMarks: {
      type: Number,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    topic: {
      type: String, // Auto-detected topic for weak topic analysis
      default: '',
    },
    // AI-generated model answer for evaluation reference
    modelAnswer: {
      type: String,
      default: '',
    },
    // Scenario specific nested subquestions
    subQuestions: [
      {
        type: {
          type: String,
          enum: ['mcq', 'short', 'long'],
          required: true,
        },
        questionText: {
          type: String,
          required: true,
        },
        options: {
          A: { type: String, default: '' },
          B: { type: String, default: '' },
          C: { type: String, default: '' },
          D: { type: String, default: '' },
        },
        correctAnswer: {
          type: String,
          default: '',
        },
        maxMarks: {
          type: Number,
          default: 1,
        },
        modelAnswer: {
          type: String,
          default: '',
        },
        explanation: {
          type: String,
          default: '',
        },
      }
    ],
    orderIndex: {
      type: Number, // Position in the test
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
