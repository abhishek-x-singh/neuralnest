const { tokenize } = require('./vectorStore');

function sentenceSplit(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceScore(sentence, questionTokens) {
  const sentenceTokens = new Set(tokenize(sentence));
  let overlap = 0;

  for (const token of questionTokens) {
    if (sentenceTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap;
}

function localRagAnswer({ question, contexts }) {
  const questionTokens = tokenize(question);
  const candidates = [];

  for (const context of contexts) {
    for (const sentence of sentenceSplit(context.text)) {
      const score = sentenceScore(sentence, questionTokens);
      if (score > 0) {
        candidates.push({ sentence, score, source: context.source });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (!candidates.length) {
    return {
      answer: 'I could not find a reliable answer in the uploaded knowledge base.',
      references: contexts.map((context) => context.source)
    };
  }

  const topSentences = candidates.slice(0, 2).map((candidate) => candidate.sentence);
  return {
    answer: topSentences.join(' '),
    references: contexts.map((context) => context.source)
  };
}

function hostedModelAnswer() {
  throw new Error('Hosted model integration is not configured. Set MODEL_PROVIDER=local or add your hosted provider implementation.');
}

function answerQuestion(input) {
  const provider = process.env.MODEL_PROVIDER || 'local';
  if (provider === 'local') {
    return localRagAnswer(input);
  }

  return hostedModelAnswer(input);
}

module.exports = {
  answerQuestion,
  localRagAnswer
};
