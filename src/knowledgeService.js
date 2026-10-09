const crypto = require('node:crypto');
const { chunkDocument, embed, cosineSimilarity } = require('./vectorStore');
const { answerQuestion } = require('./modelProviders');

class KnowledgeService {
  constructor() {
    this.documents = new Map();
    this.passages = [];
  }

  addDocument({ title, content, category = 'general', tags = [] }) {
    const id = crypto.randomUUID();
    const chunks = chunkDocument(content);

    const document = {
      id,
      title,
      category,
      tags,
      content,
      chunkCount: chunks.length,
      createdAt: new Date().toISOString()
    };

    this.documents.set(id, document);

    chunks.forEach((chunkText, index) => {
      this.passages.push({
        id: `${id}:${index}`,
        documentId: id,
        title,
        category,
        tags,
        index,
        text: chunkText,
        embedding: embed(chunkText)
      });
    });

    return document;
  }

  listDocuments() {
    return Array.from(this.documents.values());
  }

  retrieve(question, topK = 3) {
    const queryEmbedding = embed(question);

    return this.passages
      .map((passage) => ({
        ...passage,
        score: cosineSimilarity(queryEmbedding, passage.embedding)
      }))
      .filter((passage) => passage.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  askQuestion(question, topK = 3) {
    const contexts = this.retrieve(question, topK).map((passage) => ({
      text: passage.text,
      source: {
        documentId: passage.documentId,
        title: passage.title,
        passageIndex: passage.index,
        score: Number(passage.score.toFixed(4))
      }
    }));

    const response = answerQuestion({ question, contexts });
    return {
      question,
      answer: response.answer,
      sources: response.references,
      retrievedPassages: contexts
    };
  }

  summarizeDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const sentenceCandidates = document.content
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const summary = sentenceCandidates.slice(0, 3).join(' ');
    return {
      documentId,
      title: document.title,
      summary: summary || document.content.slice(0, 280)
    };
  }

  generateStudyTools(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const summary = this.summarizeDocument(documentId)?.summary || '';
    const keywords = Array.from(
      new Set(
        summary
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((token) => token.length > 5)
      )
    ).slice(0, 3);

    return {
      documentId,
      flashcards: keywords.map((keyword) => ({
        term: keyword,
        prompt: `Explain how "${keyword}" is used in ${document.title}.`
      }))
    };
  }
}

module.exports = {
  KnowledgeService
};
