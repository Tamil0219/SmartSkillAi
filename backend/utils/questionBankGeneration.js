function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function splitIntoSentences(text) {
  return normalizeWhitespace(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

function createGenericFallbackQuestions(numQuestions = 5, difficulty = 'Medium') {
  const templates = [
    {
      question: 'Which statement best matches the main idea of the provided content?',
      options: ['It explains a core concept in a clear and structured way', 'It presents random trivia without context', 'It avoids examples and practical details', 'It is only meant for memorization without understanding'],
    },
    {
      question: 'What is the main purpose of the material presented?',
      options: ['To explain important ideas and support understanding', 'To confuse the reader with unrelated facts', 'To provide unsupported opinions only', 'To replace practice with passive reading alone'],
    },
    {
      question: 'Which approach is most consistent with the content?',
      options: ['Studying the main ideas and applying them carefully', 'Skipping examples and focusing only on labels', 'Ignoring structure and memorizing fragments', 'Treating every section as disconnected information'],
    },
  ];

  const questions = [];
  for (let i = 0; i < Math.max(1, numQuestions); i += 1) {
    const template = templates[i % templates.length];
    const options = [...template.options].sort(() => Math.random() - 0.5);
    questions.push({
      question: template.question,
      options,
      correctAnswer: options[0],
      difficulty,
    });
  }

  return questions;
}

function createContentAwareFallbackQuestions(sourceText, numQuestions = 5, difficulty = 'Medium') {
  const sentences = splitIntoSentences(sourceText);
  if (sentences.length === 0) {
    return createGenericFallbackQuestions(numQuestions, difficulty);
  }

  const questions = [];
  const usedIndexes = new Set();

  while (questions.length < Math.max(1, numQuestions) && usedIndexes.size < sentences.length) {
    const index = Math.floor(Math.random() * sentences.length);
    if (usedIndexes.has(index)) continue;

    usedIndexes.add(index);
    const sentence = sentences[index];
    const cleaned = sentence.replace(/\s+/g, ' ').trim();
    const keyTerm = cleaned.split(/\s+/).filter((word) => word.length > 3).slice(0, 4).join(' ');
    const questionText = `What is the best summary of the content related to "${keyTerm || 'the topic'}"?`;
    const options = [
      cleaned.length > 140 ? `${cleaned.slice(0, 140)}...` : cleaned,
      sentences[(index + 1) % sentences.length]?.slice(0, 140) || 'It focuses on clear explanations and practical understanding',
      'It avoids any meaningful structure or examples',
      'It contains unrelated facts with no clear purpose',
    ];

    const shuffled = [...options].sort(() => Math.random() - 0.5);
    questions.push({
      question: questionText,
      options: shuffled,
      correctAnswer: shuffled[0],
      difficulty,
    });
  }

  return questions.slice(0, Math.max(1, numQuestions));
}

function buildQuestionBankPrompt(sourceText, numQuestions = 5, difficulty = 'Medium') {
  const preview = normalizeWhitespace(sourceText).slice(0, 12000);
  return [
    'You are an expert exam designer.',
    'Use only the information provided in the question bank below.',
    'Do not invent facts, do not use generic trivia, and do not create questions that are not supported by the content.',
    'Each question must be directly grounded in a specific idea, term, example, or concept from the bank.',
    `Create exactly ${numQuestions} high-quality multiple-choice questions for a ${String(difficulty).toLowerCase()} difficulty exam.`,
    'Return ONLY a valid JSON array of objects with this exact structure:',
    '{"question":"...","options":["...","...","...","..."],"correctAnswer":"...","difficulty":"Medium"}',
    'Every question must have four distinct options and the correctAnswer must exactly match one of the options.',
    'Do not include markdown, explanations, or commentary.',
    'Question bank content:',
    preview,
  ].join('\n');
}

function extractJsonArrayFromResponse(rawText) {
  if (!rawText) return null;

  const cleaned = String(rawText)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const tryParse = (text) => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : null;
    } catch (_error) {
      return null;
    }
  };

  const direct = tryParse(cleaned);
  if (direct) return direct;

  const start = cleaned.indexOf('[');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);
        return tryParse(candidate);
      }
    }
  }

  return null;
}

function normalizeQuestions(parsedQuestions, numQuestions = 5, difficulty = 'Medium') {
  if (!Array.isArray(parsedQuestions)) return [];

  const normalized = parsedQuestions
    .filter((item) => item && item.question && Array.isArray(item.options) && item.correctAnswer)
    .map((item) => ({
      question: normalizeWhitespace(item.question),
      options: item.options.map((option) => normalizeWhitespace(option)).filter(Boolean).slice(0, 4),
      correctAnswer: normalizeWhitespace(item.correctAnswer),
      difficulty: item.difficulty || difficulty,
    }))
    .filter((item) => item.options.length >= 4 && item.correctAnswer);

  return normalized.slice(0, numQuestions);
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

module.exports = {
  buildQuestionBankPrompt,
  createContentAwareFallbackQuestions,
  createGenericFallbackQuestions,
  extractJsonArrayFromResponse,
  normalizeQuestions,
  shuffleQuestions,
};
