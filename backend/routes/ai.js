const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");
const User = require("../models/User");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const Resource = require("../models/Resource");

const router = express.Router();

// Store conversation history for context (in production, use database)
const conversationHistory = new Map();

// Fallback AI responses (when API is unavailable)
const fallbackResponses = {
  greeting: [
    "Hello! I'm Tom AI, your educational assistant. How can I help you with your studies today?",
    "Hi there! I'm here to help you with course concepts, exam preparation, and learning strategies.",
    "Welcome! I'm ready to assist you. What would you like to learn about?"
  ],
  exam: [
    "Great question! For exam preparation, I recommend: 1) Review key concepts, 2) Practice past papers, 3) Take mock tests, 4) Identify weak areas, 5) Focus on high-value topics. Good luck!",
    "Exam preparation tips: Create a study schedule, break topics into chunks, use active recall, teach concepts to others, and test yourself regularly.",
    "To excel in exams: Understand concepts deeply, practice problems, review mistakes, manage time during tests, and get adequate sleep before the exam."
  ],
  concept: [
    "That's an important concept! Let me break it down: First, understand the fundamentals, then apply it to real-world examples. Would you like me to explain further?",
    "Great topic! I recommend: 1) Reading the concept description, 2) Watching the video lectures, 3) Solving practice problems, 4) Reviewing notes. What specific part would you like help with?",
    "I can help you understand this better. Try to: Connect it to what you already know, practice with examples, and ask questions when stuck."
  ],
  default: [
    "That's an interesting question! Based on what I know about learning, I'd recommend breaking it down into smaller parts and practicing regularly.",
    "Good question! Here's what I suggest: Focus on understanding the fundamentals first, then practice with examples, and don't hesitate to review when needed.",
    "I appreciate your curiosity! To get better at this: Study the concepts, practice problems, review your mistakes, and seek help when needed."
  ]
};

// Intelligent fallback response generator
function getIntelligentResponse(userMessage, userName) {
  const message = userMessage.toLowerCase();
  const firstName = userName ? userName.split(" ")[0] : null;
  const personalizedGreeting = firstName
    ? `Hi ${firstName}, how can I help you today?`
    : null;

  // Check for greeting keywords
  if (/(?:^|\b)(hello|hi|hey|greetings)\b/.test(message)) {
    if (personalizedGreeting) {
      return personalizedGreeting;
    }
    return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
  }

  // Check for exam-related keywords
  if (/exam|test|quiz|assessment|prepare/.test(message)) {
    return fallbackResponses.exam[Math.floor(Math.random() * fallbackResponses.exam.length)];
  }

  // Check for concept-related keywords
  if (/concept|understand|explain|what is|how|teach/.test(message)) {
    return fallbackResponses.concept[Math.floor(Math.random() * fallbackResponses.concept.length)];
  }

  // Default response
  return fallbackResponses.default[Math.floor(Math.random() * fallbackResponses.default.length)];
}

const STOP_WORDS = new Set([
  'the','a','an','in','on','at','of','for','to','and','or','is','are','was','were','be','been','being','with','as','by','that','this','these','those','it','its','from','your','you','i','we','they','their','have','has','had','will','can','could','should','would'
]);

function normalizeText(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word) && word.length > 1);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreText(text, queryTerms) {
  const normalized = normalizeText(text);
  return queryTerms.reduce((score, term) => {
    if (!term) return score;
    const matches = normalized.match(new RegExp(`\\b${escapeRegex(term)}\\b`, "g"));
    return score + (matches ? matches.length : 0);
  }, 0);
}

function getSnippet(text, queryTerms, maxLen = 320) {
  if (!text || queryTerms.length === 0) {
    return text && text.length <= maxLen ? text.trim() : (text || "").slice(0, maxLen).trim() + "...";
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  for (const term of queryTerms) {
    if (!term) continue;
    const index = lower.indexOf(term);
    if (index !== -1) {
      const start = Math.max(0, index - 120);
      const end = Math.min(normalized.length, index + term.length + 180);
      let snippet = normalized.slice(start, end).trim();
      if (start > 0) snippet = `...${snippet}`;
      if (end < normalized.length) snippet = `${snippet}...`;
      return snippet;
    }
  }

  return normalized.length <= maxLen ? normalized : `${normalized.slice(0, maxLen).trim()}...`;
}

async function loadStudentMaterials(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return { user: null, courses: [], exams: [], resources: [] };

  let mentorId = null;
  if (user.role === 'student') {
    mentorId = user.mentorId;
  } else if (user.role === 'mentor') {
    mentorId = user._id;
  } else {
    mentorId = user.mentorId || null;
  }

  const [courses, exams, resources] = await Promise.all([
    mentorId ? Course.find({ mentorId }).lean() : [],
    mentorId ? Exam.find({ mentorId }).populate('courseId', 'title').lean() : [],
    mentorId ? Resource.find({ mentorId }).lean() : []
  ]);

  return { user, courses, exams, resources };
}

function buildStudySources(courses, exams, resources, question) {
  const queryTerms = tokenize(question).slice(0, 20);
  const candidates = [];

  courses.forEach((course) => {
    const textParts = [];
    if (course.title) textParts.push(course.title);
    if (course.description) textParts.push(course.description);
    if (course.notes) textParts.push(course.notes);
    const text = textParts.join("\n\n");
    const score = scoreText(text, queryTerms) + (course.notes ? 2 : 0);
    candidates.push({
      type: 'Course',
      title: course.title || 'Course content',
      sourceLabel: `Course: ${course.title}`,
      text,
      url: course.attachments?.length ? course.attachments[0] : null,
      score,
      metadata: course
    });
  });

  exams.forEach((exam) => {
    const textParts = [exam.title || 'Exam material'];
    if (exam.questions?.length) textParts.push(exam.questions.join('\n'));
    if (exam.difficulty) textParts.push(`Difficulty: ${exam.difficulty}`);
    if (exam.timeLimit) textParts.push(`Time Limit: ${exam.timeLimit} minutes`);
    if (typeof exam.questionCount !== 'undefined') textParts.push(`Question Count: ${exam.questionCount}`);
    if (exam.courseId?.title) textParts.unshift(`Course: ${exam.courseId.title}`);
    const text = textParts.join("\n\n");
    const score = scoreText(text, queryTerms) + 1;
    candidates.push({
      type: 'Exam',
      title: exam.title || 'Exam material',
      sourceLabel: `Exam: ${exam.title}`,
      text,
      url: null,
      score,
      metadata: exam
    });
  });

  resources.forEach((resource) => {
    const textParts = [resource.title || 'Resource'];
    if (resource.description) textParts.push(resource.description);
    if (resource.type) textParts.push(`Type: ${resource.type}`);
    const text = textParts.join("\n\n");
    const score = scoreText(text, queryTerms) + (resource.description ? 1 : 0);
    candidates.push({
      type: 'Resource',
      title: resource.title || 'Resource',
      sourceLabel: `Resource: ${resource.title}`,
      text,
      url: resource.url || null,
      score,
      metadata: resource
    });
  });

  candidates.sort((a, b) => b.score - a.score);

  const selected = candidates.filter((candidate) => candidate.score > 0).slice(0, 4);
  if (selected.length === 0 && candidates.length > 0) {
    selected.push(candidates[0]);
  }

  return selected.map((candidate) => ({
    type: candidate.type,
    title: candidate.title,
    sourceLabel: candidate.sourceLabel,
    url: candidate.url,
    snippet: getSnippet(candidate.text, queryTerms),
  }));
}

function buildSourceContext(sources, question) {
  if (!sources || sources.length === 0) {
    return `I could not locate direct course notes, exam details, or resource passages for this question. Answer the student using general tutoring style and be transparent about the lack of source documents.`;
  }

  const lines = [
    'Use the following student learning materials to answer the question. Cite sources in brackets using the source labels exactly as shown.',
    '',
  ];

  sources.forEach((source, index) => {
    lines.push(`${index + 1}. [${source.sourceLabel}]`);
    if (source.url) lines.push(`URL: ${source.url}`);
    lines.push(source.snippet);
    lines.push('');
  });

  lines.push('Answer the question below in a student-friendly tone, and reference the source labels when relevant.');
  lines.push('');
  lines.push(`Student question: ${question}`);

  return lines.join('\n');
}

async function buildAiMessagesWithContext(userId, question) {
  const { courses, exams, resources } = await loadStudentMaterials(userId);
  const sources = buildStudySources(courses, exams, resources, question);
  const contextText = buildSourceContext(sources, question);

  return [
    {
      role: 'system',
      content: 'You are Tom AI, a student-facing educational assistant. Use only the provided course and exam materials to answer when possible. Keep answers clear, friendly, and cite sources using the labels provided.'
    },
    {
      role: 'user',
      content: contextText
    }
  ];
}

function getGroqConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY,
    model: process.env.GROQ_MODEL || process.env.GROK_MODEL || "llama-3.1-8b-instant",
    apiUrl: process.env.GROQ_API_URL || process.env.GROK_API_URL || "https://api.groq.com/openai/v1/chat/completions"
  };
}

/**
 * POST /api/ai/chat
 * Send a question and get AI response
 */
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const user = await User.findById(userId).lean();
    const userName = user?.name || "";

    // Create unique conversation ID
    const conversationId = sessionId || `${userId}-${Date.now()}`;

    // Get or create conversation history
    if (!conversationHistory.has(conversationId)) {
      conversationHistory.set(conversationId, []);
    }

    const history = conversationHistory.get(conversationId);

    let aiResponse = "";
    const aiMessages = await buildAiMessagesWithContext(userId, message);

    // Try external API first
    try {
      const groqConfig = getGroqConfig();
      if (groqConfig.apiKey) {
        const response = await axios.post(
          groqConfig.apiUrl,
          {
            model: groqConfig.model,
            messages: aiMessages,
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              Authorization: `Bearer ${groqConfig.apiKey}`,
              "Content-Type": "application/json"
            },
            timeout: 15000
          }
        );

        const groqText = response.data?.choices?.[0]?.message?.content;
        if (groqText) {
          aiResponse = groqText;
          console.log("Using Groq API with contextual student materials");
        }
      }
    } catch (error) {
      console.log("Groq API failed, trying fallback...", error.message || error);
      aiResponse = null;
    }

    if (!aiResponse) {
      try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (apiKey) {
          const geminiText = aiMessages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n");
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            {
              contents: [{
                parts: [{
                  text: geminiText
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500
              }
            },
            {
              headers: {
                "Content-Type": "application/json"
              },
              timeout: 15000
            }
          );

          if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiResponse = response.data.candidates[0].content.parts[0].text;
            console.log("Using Gemini Pro API with contextual student materials");
          }
        }
      } catch (error) {
        console.log("Gemini Pro API failed, trying fallback...", error.message || error);
        aiResponse = null;
      }
    }

    // If API fails, use intelligent fallback
    if (!aiResponse) {
      console.log("Using fallback response system");
      aiResponse = getIntelligentResponse(message, userName);
    }

    // Store messages in history
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: aiResponse });

    // Keep history manageable (last 20 messages)
    if (history.length > 20) {
      conversationHistory.set(conversationId, history.slice(-20));
    }

    res.json({
      success: true,
      data: {
        sessionId: conversationId,
        response: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get AI response. Please try again.",
    });
  }
});

/**
 * POST /api/ai/clear-chat
 * Clear conversation history
 */
router.post("/clear-chat", authMiddleware, (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId && conversationHistory.has(sessionId)) {
      conversationHistory.delete(sessionId);
    }

    res.json({ success: true, message: "Conversation cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/ai/test
 * Test AI API connection
 */
router.post("/test", authMiddleware, async (req, res) => {
  try {
    const groqConfig = getGroqConfig();
    
    if (!groqConfig.apiKey && !process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(200).json({
        success: true,
        message: "Fallback mode active - using intelligent response system",
        mode: "fallback",
        testResponse: getIntelligentResponse("Hello, this is a test")
      });
    }

    try {
      if (groqConfig.apiKey) {
        const response = await axios.post(
          groqConfig.apiUrl,
          {
            model: groqConfig.model,
            messages: [{ role: "user", content: "Respond with exactly: 'API test successful'" }],
            temperature: 0.1,
            max_tokens: 50
          },
          {
            headers: {
              Authorization: `Bearer ${groqConfig.apiKey}`,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );

        const groqText = response.data?.choices?.[0]?.message?.content;
        if (groqText) {
          return res.json({
            success: true,
            message: "Groq API test successful",
            mode: "live",
            response: groqText
          });
        }
      }
    } catch (error) {
      console.log("Groq API test failed, switching to fallback");
    }

    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No Gemini API key");
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: "Respond with exactly: 'API test successful'"
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50
          }
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({
          success: true,
          message: "Gemini Pro API test successful",
          mode: "live",
          response: response.data.candidates[0].content.parts[0].text
        });
      }
    } catch (error) {
      console.log("Gemini Pro API test failed, switching to fallback");
    }

    // Fallback if API fails
    return res.status(200).json({
      success: true,
      message: "Fallback mode active - using intelligent response system",
      mode: "fallback",
      testResponse: getIntelligentResponse("Hello, this is a test")
    });
  } catch (error) {
    console.error("API Test Error:", error.message);
    res.status(200).json({
      success: true,
      message: "Fallback mode active - using intelligent response system",
      mode: "fallback",
      testResponse: getIntelligentResponse("Hello, this is a test")
    });
  }
});

module.exports = router;
