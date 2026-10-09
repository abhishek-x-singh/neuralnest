const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('uploads documents and answers a question with sources', async () => {
  const app = createApp();

  const upload = await request(app).post('/documents').send({
    title: 'RAG Notes',
    category: 'ai',
    tags: ['rag'],
    content:
      'Retrieval-Augmented Generation combines retrieval with answer generation. It improves answer grounding with source passages.'
  });

  assert.equal(upload.status, 201);
  assert.equal(upload.body.title, 'RAG Notes');

  const answer = await request(app).post('/ask').send({
    question: 'How does retrieval-augmented generation improve answers?'
  });

  assert.equal(answer.status, 200);
  assert.ok(answer.body.answer.length > 0);
  assert.ok(Array.isArray(answer.body.sources));
  assert.ok(answer.body.sources.length >= 1);
  assert.equal(answer.body.sources[0].title, 'RAG Notes');
});

test('returns summary and study tools for a document', async () => {
  const app = createApp();

  const upload = await request(app).post('/documents').send({
    title: 'Semantic Search',
    content:
      'Semantic search finds meaning instead of exact words. Vector embeddings encode context. This enables better passage ranking for Q and A systems.'
  });

  const id = upload.body.id;

  const summary = await request(app).get(`/documents/${id}/summary`);
  assert.equal(summary.status, 200);
  assert.ok(summary.body.summary.includes('Semantic search'));

  const studyTools = await request(app).get(`/documents/${id}/study-tools`);
  assert.equal(studyTools.status, 200);
  assert.ok(Array.isArray(studyTools.body.flashcards));
});
