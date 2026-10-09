const express = require('express');
const { KnowledgeService } = require('./knowledgeService');

function createApp() {
  const app = express();
  const knowledge = new KnowledgeService();

  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/documents', (req, res) => {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'title and content are required.'
      });
    }

    const document = knowledge.addDocument({
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : []
    });

    return res.status(201).json(document);
  });

  app.get('/documents', (_req, res) => {
    res.json({ documents: knowledge.listDocuments() });
  });

  app.post('/ask', (req, res) => {
    const { question, topK } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required.' });
    }

    const result = knowledge.askQuestion(question, Number(topK) || 3);
    return res.json(result);
  });

  app.get('/documents/:id/summary', (req, res) => {
    const result = knowledge.summarizeDocument(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'document not found.' });
    }

    return res.json(result);
  });

  app.get('/documents/:id/study-tools', (req, res) => {
    const result = knowledge.generateStudyTools(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'document not found.' });
    }

    return res.json(result);
  });

  return app;
}

module.exports = {
  createApp
};
