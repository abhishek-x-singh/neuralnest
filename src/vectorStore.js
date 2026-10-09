function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function chunkDocument(content, chunkSize = 450) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const chunks = [];
  for (let index = 0; index < content.length; index += chunkSize) {
    const text = content.slice(index, index + chunkSize).trim();
    if (text) {
      chunks.push(text);
    }
  }
  return chunks;
}

function embed(text) {
  const vector = new Map();
  for (const token of tokenize(text)) {
    vector.set(token, (vector.get(token) || 0) + 1);
  }
  return vector;
}

function cosineSimilarity(vectorA, vectorB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of vectorA.values()) {
    normA += value * value;
  }

  for (const value of vectorB.values()) {
    normB += value * value;
  }

  for (const [token, valueA] of vectorA.entries()) {
    const valueB = vectorB.get(token) || 0;
    dot += valueA * valueB;
  }

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  tokenize,
  chunkDocument,
  embed,
  cosineSimilarity
};
