const Document = require('../models/Document');
const { getAssistantResponse } = require('../services/assistantService');

/**
 * @desc    Interact with the AI Assistant
 * @route   POST /api/assistant/chat
 * @access  Private
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message history as an array of message objects.',
      });
    }

    // Fetch user documents to supply context of uploaded files
    const documents = await Document.find({ user: req.user.id })
      .select('originalName subject')
      .sort({ createdAt: -1 });

    const userDocuments = documents.map(doc => ({
      title: doc.originalName,
      subject: doc.subject
    }));

    const reply = await getAssistantResponse(messages, userDocuments);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chatWithAssistant };
