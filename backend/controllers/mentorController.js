const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Question = require('../models/Question');
const Resource = require('../models/Resource');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  buildQuestionBankPrompt,
  createContentAwareFallbackQuestions,
  createGenericFallbackQuestions,
  extractJsonArrayFromResponse,
  normalizeQuestions,
  shuffleQuestions,
} = require('../utils/questionBankGeneration');

const getMentorId = (req) => req.user?.id;

/**
 * Generate fallback questions when API fails
 * Creates intelligent multiple-choice questions based on PDF content
 */
function generateFallbackQuestions(pdfText, numQuestions = 5, difficulty = 'Medium') {
  const contentAware = createContentAwareFallbackQuestions(pdfText, numQuestions, difficulty);
  if (contentAware.length >= Math.max(1, numQuestions)) {
    return contentAware.slice(0, Math.max(1, numQuestions));
  }

  return contentAware.length > 0
    ? contentAware.concat(createDefaultQuestions(Math.max(1, numQuestions) - contentAware.length, difficulty))
    : createGenericFallbackQuestions(Math.max(1, numQuestions), difficulty);
}

/**
 * Create default fallback questions when content analysis fails
 */
function createDefaultQuestions(numQuestions = 5, difficulty = 'Medium') {
  const templates = [
    {
      question: 'Which of the following is a key concept discussed in the material?',
      options: ['Understanding core principles', 'Basic foundational knowledge', 'Advanced implementation', 'Practical application']
    },
    {
      question: 'According to the material, what is the primary focus?',
      options: ['Learning and understanding concepts', 'Memorizing facts', 'Following procedures exactly', 'Completing assignments']
    },
    {
      question: 'The material emphasizes the importance of:',
      options: ['Conceptual understanding', 'Speed and efficiency', 'Following rules strictly', 'Working independently']
    },
    {
      question: 'What approach is recommended in the material?',
      options: ['Deep understanding with practice', 'Quick memorization', 'Passive reading only', 'Theory without examples']
    },
    {
      question: 'The content suggests that learning requires:',
      options: ['Active engagement and practice', 'Passive listening alone', 'Reading once is enough', 'No repetition needed']
    }
  ];

  const questions = [];
  for (let i = 0; i < Math.max(1, numQuestions); i++) {
    const t = templates[i % templates.length];
    const options = [...t.options].sort(() => Math.random() - 0.5);
    questions.push({
      question: t.question,
      options,
      correctAnswer: options[0],
      difficulty
    });
  }

  return questions;
}

function getGroqConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY,
    model: process.env.GROQ_MODEL || process.env.GROK_MODEL || 'llama-3.1-8b-instant',
    apiUrl: process.env.GROQ_API_URL || process.env.GROK_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
  };
}

async function generateQuestionsWithGroq(sourceText, numQuestions = 5, difficulty = 'Medium') {
  const groqConfig = getGroqConfig();
  if (!groqConfig.apiKey) {
    return null;
  }

  const prompt = buildQuestionBankPrompt(sourceText, numQuestions, difficulty);

  try {
    const response = await axios.post(
      groqConfig.apiUrl,
      {
        model: groqConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 2500,
      },
      {
        headers: {
          Authorization: `Bearer ${groqConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content || '';
    const parsedQuestions = extractJsonArrayFromResponse(raw);
    if (!Array.isArray(parsedQuestions)) {
      return null;
    }

    const validatedQuestions = normalizeQuestions(parsedQuestions, numQuestions, difficulty);
    if (validatedQuestions.length >= numQuestions) {
      return validatedQuestions.slice(0, numQuestions);
    }

    return validatedQuestions.concat(
      createDefaultQuestions(numQuestions - validatedQuestions.length, difficulty)
    ).slice(0, numQuestions);
  } catch (error) {
    console.warn('Groq question generation failed:', error.message);
    return null;
  }
}

exports.getDashboard = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const totalStudents = await User.countDocuments({ role: 'student', mentorId });
    const totalCourses = await Course.countDocuments({ mentorId });
    const totalExams = await Exam.countDocuments({ mentorId });

    const examIds = await Exam.find({ mentorId }).distinct('_id');
    const activeStudents = await Result.distinct('studentId', { examId: { $in: examIds } });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalExams,
        activeStudents: activeStudents.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const mentor = await User.findById(mentorId).select('-password');
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const students = await User.find({ role: 'student', mentorId });
    const studentIds = students.map((s) => s._id);

    const results = await Result.find({ studentId: { $in: studentIds } }).sort({ createdAt: -1 });

    const studentStats = results.reduce((acc, result) => {
      const sid = result.studentId.toString();
      if (!acc[sid]) {
        acc[sid] = {
          examScores: new Map(), // examId to latest score
          latestScore: result.score,
          latestAt: result.createdAt,
        };
      }

      const examId = result.examId.toString();
      if (!acc[sid].examScores.has(examId) || result.createdAt > acc[sid].examScores.get(examId).date) {
        acc[sid].examScores.set(examId, { score: result.score, date: result.createdAt });
      }

      if (result.createdAt > acc[sid].latestAt) {
        acc[sid].latestScore = result.score;
        acc[sid].latestAt = result.createdAt;
      }

      return acc;
    }, {});

    const studentsWithScores = students.map((student) => {
      const stats = studentStats[student._id.toString()] || { examScores: new Map(), latestScore: null };
      const scores = Array.from(stats.examScores.values()).map(s => s.score);
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        mentorId: student.mentorId,
        examsAttempted: stats.examScores.size,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        latestScore: stats.latestScore,
      };
    });

    res.json({ success: true, students: studentsWithScores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    // Get mentor's adminId
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.adminId) {
      return res.status(400).json({ success: false, message: 'Mentor adminId not found' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({ name, email, password: hashedPassword, role: 'student', mentorId, adminId: mentor.adminId });
    await student.save();
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const courses = await Course.find({ mentorId });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, description, youtubeUrl, notes, attachments } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }

    // Get mentor's adminId
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.adminId) {
      return res.status(400).json({ success: false, message: 'Mentor adminId not found' });
    }

    const course = new Course({ title, description, youtubeUrl, notes, attachments, mentorId, adminId: mentor.adminId });
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const { id } = req.params;
    const updated = await Course.findOneAndUpdate({ _id: id, mentorId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const { id } = req.params;
    const removed = await Course.findOneAndDelete({ _id: id, mentorId });
    if (!removed) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: removed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      console.error('❌ Upload failed: No file provided');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('📁 File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const fileUrl = `${apiUrl}/uploads/${req.file.filename}`;
    
    console.log('✅ File uploaded successfully:', fileUrl);
    
    res.json({ 
      success: true, 
      fileUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateQuestionsFromPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No question bank file uploaded' });
    }

    console.log('📚 Processing uploaded question bank:', req.file.filename);

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let sourceText = '';

    if (fileExt === '.pdf') {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfParser = new PDFParse({ data: pdfBuffer });
      const pdfData = await pdfParser.getText();
      sourceText = pdfData.text;
      await pdfParser.destroy();
    } else if (['.txt', '.md', '.json', '.csv'].includes(fileExt)) {
      sourceText = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(400).json({ success: false, message: 'Please upload a PDF, TXT, MD, JSON, or CSV question bank file' });
    }

    if (!sourceText || sourceText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the uploaded question bank' });
    }

    console.log('✅ Question bank text extracted, length:', sourceText.length);

    const requestedCount = parseInt(req.body.questionCount || req.body.numQuestions || '5', 10);
    const questionCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 5;
    const difficulty = req.body.difficulty || 'Medium';

    let questions = [];

    const groqQuestions = await generateQuestionsWithGroq(sourceText, questionCount, difficulty);
    if (groqQuestions && groqQuestions.length > 0) {
      questions = groqQuestions;
      console.log('✅ Generated', questions.length, 'questions from uploaded bank using Groq');
    } else {
      console.log('⚠️ Groq analysis unavailable, using fallback generation');
      questions = generateFallbackQuestions(sourceText, questionCount, difficulty);
    }

    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Failed to generate questions. Please try again later.' });
    }

    const missingQuestions = Math.max(0, questionCount - questions.length);
    if (missingQuestions > 0) {
      questions = questions.concat(createDefaultQuestions(missingQuestions, difficulty));
    }

    questions = shuffleQuestions(questions).slice(0, questionCount);

    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not delete temp uploaded file:', err);
    });

    res.json({
      success: true,
      questions,
      count: questions.length,
      message: `Successfully generated ${questions.length} questions from the uploaded question bank`
    });
  } catch (error) {
    console.error('❌ Generate questions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResources = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const resources = await Resource.find({ mentorId });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Get mentor's adminId
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.adminId) {
      return res.status(400).json({ success: false, message: 'Mentor adminId not found' });
    }

    const { title, description, courseId, type, url } = req.body;
    const resource = new Resource({ title, description, courseId, mentorId, adminId: mentor.adminId, type, url });
    await resource.save();
    res.json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const exams = await Exam.find({ mentorId }).populate('courseId');
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Get mentor's adminId
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.adminId) {
      return res.status(400).json({ success: false, message: 'Mentor adminId not found' });
    }

    const { title, courseId, timeLimit, difficulty, completionDate, questionCount, questions: questionsData } = req.body;
    const requestedCount = Number.isFinite(parseInt(questionCount, 10)) ? parseInt(questionCount, 10) : 0;
    const finalQuestionCount = requestedCount > 0 ? requestedCount : (Array.isArray(questionsData) ? questionsData.length : 5);
    const finalTimeLimit = Number.isFinite(Number(timeLimit)) && Number(timeLimit) > 0 ? Number(timeLimit) : 10;
    
    // Create the exam
    const exam = new Exam({ 
      title, 
      courseId, 
      mentorId, 
      adminId: mentor.adminId, 
      timeLimit: finalTimeLimit, 
      questionCount: finalQuestionCount,
      difficulty,
      completionDate: completionDate ? new Date(completionDate) : null
    });
    await exam.save();

    // Create questions if provided
    const createdQuestions = [];
    const finalQuestions = Array.isArray(questionsData) && questionsData.length > 0
      ? questionsData.slice(0, requestedCount)
      : [];

    if (finalQuestions.length > 0) {
      for (const qData of finalQuestions) {
        const question = new Question({
          examId: exam._id,
          adminId: mentor.adminId,
          question: qData.question,
          options: qData.options,
          correctAnswer: qData.correctAnswer,
          difficulty: qData.difficulty || difficulty
        });
        await question.save();
        createdQuestions.push(question);
      }

      if (createdQuestions.length < requestedCount) {
        const extraQuestions = createDefaultQuestions(requestedCount - createdQuestions.length, difficulty);
        for (const qData of extraQuestions) {
          const question = new Question({
            examId: exam._id,
            adminId: mentor.adminId,
            question: qData.question,
            options: qData.options,
            correctAnswer: qData.correctAnswer,
            difficulty: qData.difficulty || difficulty
          });
          await question.save();
          createdQuestions.push(question);
        }
      }

      console.log(`✅ Created ${createdQuestions.length} questions for exam`);
    }

    res.json({ 
      success: true, 
      exam,
      questions: createdQuestions.length,
      message: `Exam created with ${createdQuestions.length} questions`
    });
  } catch (error) {
    console.error('Create exam error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = await Question.find({ examId });
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Get mentor's adminId
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.adminId) {
      return res.status(400).json({ success: false, message: 'Mentor adminId not found' });
    }

    const { examId, question, options, correctAnswer, difficulty } = req.body;
    
    // Validation: Check if question is blank
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter the question text. Question field cannot be empty.' });
    }

    // Validation: Check if options are provided
    if (!options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one option for the question.' });
    }

    // Validation: Check if correctAnswer is provided
    if (!correctAnswer || !correctAnswer.trim()) {
      return res.status(400).json({ success: false, message: 'Please select the correct answer.' });
    }

    const newQuestion = new Question({ examId, adminId: mentor.adminId, question, options, correctAnswer, difficulty });
    await newQuestion.save();
    res.json({ success: true, question: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const mentorId = getMentorId(req);

    const courses = await Course.find({ mentorId });
    const exams = await Exam.find({ mentorId });

    const studentIds = (await User.find({ role: 'student', mentorId })).map((s) => s._id);
    const results = await Result.find({ studentId: { $in: studentIds } });

    const performanceDistribution = [0, 0, 0, 0, 0];
    let totalScore = 0;
    let passCount = 0;
    let failCount = 0;

    results.forEach((r) => {
      const score = r.score;
      totalScore += score;
      if (score >= 50) passCount += 1;
      else failCount += 1;

      if (score <= 20) performanceDistribution[0]++;
      else if (score <= 40) performanceDistribution[1]++;
      else if (score <= 60) performanceDistribution[2]++;
      else if (score <= 80) performanceDistribution[3]++;
      else performanceDistribution[4]++;
    });

    const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
    const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;
    const failRate = results.length > 0 ? Math.round((failCount / results.length) * 100) : 0;

    const studentsForNames = await User.find({ _id: { $in: studentIds } }).select('name');
    const studentNameMap = studentsForNames.reduce((acc, st) => {
      acc[st._id.toString()] = st.name;
      return acc;
    }, {});

    const examsForTitles = await Exam.find({ _id: { $in: exams.map((e) => e._id) } }).select('title');
    const examTitleMap = examsForTitles.reduce((acc, ex) => {
      acc[ex._id.toString()] = ex.title;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalStudents: studentIds.length,
        totalCourses: courses.length,
        totalExams: exams.length,
        averageScore,
        passCount,
        failCount,
        passRate,
        failRate,
        performanceDistribution,
        topStudents: results
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((r) => ({
            studentId: r.studentId,
            studentName: studentNameMap[r.studentId.toString()] || "Unknown",
            examTitle: examTitleMap[r.examId?.toString()] || "Exam",
            score: r.score,
          })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const mentor = await User.findById(mentorId).select('-password');
    res.json({ success: true, mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const updates = req.body;
    if (updates.password) {
      delete updates.password;
    }
    const mentor = await User.findByIdAndUpdate(mentorId, updates, { new: true }).select('-password');
    res.json({ success: true, mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { studentId } = req.params;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ success: false, message: 'Invalid mentor ID' });
    }

    const mentorIdObj = new mongoose.Types.ObjectId(mentorId);
    const studentIdObj = new mongoose.Types.ObjectId(studentId);

    // Verify the student exists and belongs to the current mentor
    const student = await User.findOne({ _id: studentIdObj, role: 'student', mentorId: mentorIdObj });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found or not assigned to this mentor' });

    const results = await Result.find({ studentId: studentIdObj })
      .populate({
        path: 'examId',
        select: 'title courseId',
        populate: {
          path: 'courseId',
          select: 'title',
        },
      })
      .sort({ createdAt: -1 });

    const performance = {
      student: {
        name: student.name,
        email: student.email,
      },
      results: results.map((r) => ({
        examTitle: r.examId?.title || 'Unknown Exam',
        courseTitle: r.examId?.courseId?.title || 'Unknown Course',
        score: r.score,
        attempt: r.attempt,
        date: r.createdAt,
      })),
      summary: {
        totalExams: results.length,
        averageScore: results.length ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
        highestScore: results.length ? Math.max(...results.map((r) => r.score)) : 0,
        lowestScore: results.length ? Math.min(...results.map((r) => r.score)) : 0,
      },
    };

    res.json({ success: true, performance });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const students = await User.find({ role: 'student', mentorId });
    const studentIds = students.map(s => s._id);

    const results = await Result.find({ studentId: { $in: studentIds } }).populate({
      path: 'examId',
      populate: {
        path: 'courseId',
        select: 'title'
      }
    }).sort({ createdAt: -1 });

    const progressMap = {};
    results.forEach(r => {
      const sid = r.studentId.toString();
      if (!progressMap[sid]) {
        progressMap[sid] = { scores: [], latest: r };
      }
      progressMap[sid].scores.push(r.score);
    });

    const progressData = students.map(student => {
      const sid = student._id.toString();
      const data = progressMap[sid];
      if (!data) return { name: student.name, course: 'N/A', progress: 0, lastExamScore: 'N/A' };

      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const course = data.latest.examId && data.latest.examId.courseId ? data.latest.examId.courseId.title : 'N/A';
      // better to populate course
      return {
        name: student.name,
        course: course,
        progress: Math.round(avgScore),
        lastExamScore: data.latest.score
      };
    });

    res.json({ success: true, progress: progressData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamOverview = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const examIds = await Exam.find({ mentorId }).distinct('_id');
    const results = await Result.find({ examId: { $in: examIds } });

    const totalExams = results.length;
    const passCount = results.filter(r => r.score > 50).length;
    const failCount = totalExams - passCount;
    const passPercentage = totalExams > 0 ? Math.round((passCount / totalExams) * 100) : 0;
    const failPercentage = totalExams > 0 ? Math.round((failCount / totalExams) * 100) : 0;

    res.json({
      success: true,
      overview: {
        totalExams,
        passPercentage,
        failPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ mentorId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    const { notificationId } = req.params;

    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, mentorId },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const mentorId = getMentorId(req);
    if (!mentorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const Notification = require('../models/Notification');
    const unreadCount = await Notification.countDocuments({ mentorId, isRead: false });

    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
