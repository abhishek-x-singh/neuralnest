# NeuralNest Knowledge

NeuralNest Knowledge is an open-source knowledge management platform that helps users retrieve information from uploaded documents using AI-inspired retrieval and generation techniques.

## What this prototype includes

- **Document ingestion**: upload text documents through an HTTP API.
- **Document organization**: store category and tags for each document.
- **Chunking + vector embeddings**: split content into passages and convert text into sparse token vectors.
- **Semantic retrieval**: rank passages by cosine similarity against the user question.
- **RAG-style question answering**: generate answers from retrieved context and return source references.
- **AI-assisted study tools**: produce summaries and basic flashcard prompts.
- **Self-hostable**: runs locally with Node.js.

## Architecture

- `src/vectorStore.js`: tokenization, chunking, embedding, similarity scoring.
- `src/knowledgeService.js`: document store, retrieval pipeline, summarization/study helpers.
- `src/modelProviders.js`: pluggable model provider abstraction (`local` by default, hosted provider extension point).
- `src/app.js`: web API endpoints.

## API Endpoints

- `POST /documents` – add a document (`title`, `content`, optional `category`, `tags`)
- `GET /documents` – list uploaded documents
- `POST /ask` – ask a question (`question`, optional `topK`)
- `GET /documents/:id/summary` – generate a document summary
- `GET /documents/:id/study-tools` – generate study flashcard prompts
- `GET /health` – health check

## Run locally

```bash
npm install
npm start
```

Server starts on `http://localhost:3000`.

## Test

```bash
npm test
```

## Example question flow

1. Upload document text via `POST /documents`.
2. Ask a natural-language question via `POST /ask`.
3. Receive an answer plus source references with document and passage metadata.

## Notes

- The default provider (`MODEL_PROVIDER=local`) uses a deterministic local extractive answer strategy.
- Hosted model integration is intentionally modular and can be added inside `src/modelProviders.js`.
