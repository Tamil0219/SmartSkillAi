const axios = require('axios');
const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Resource = require('../models/Resource');
const Question = require('../models/Question');

const getStudentId = (req) => req.user?.id;

exports.getDashboard = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const courses = await Course.find({ mentorId: student.mentorId });
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    const latestScore = results.length ? results[0].score : 0;

    // AI Recommendation (Mocked logic)
    const avgScore = results.length
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;
    
    let recommendation = {
      title: "Foundations of Logic",
      reason: "Start by strengthening your core fundamentals.",
      difficulty: "Beginner"
    };

    if (avgScore > 80) {
      recommendation = {
        title: "Quantum Computing & Advanced AI",
        reason: "Your high performance suggests you are ready for elite topics.",
        difficulty: "Expert"
      };
    } else if (avgScore > 50) {
      recommendation = {
        title: "Full-Stack System Design",
        reason: "Expand your architecture skills to the next level.",
        difficulty: "Intermediate"
      };
    }

    res.json({
      success: true,
      data: {
        studentName: student.name,
        enrolledCourses: courses.length,
        examAttempts: results.length,
        latestScore,
        avgScore: Math.round(avgScore),
        learningProgress: Math.round(avgScore),
        recommendation
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Assigned Courses
exports.getCourses = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const courses = await Course.find({ mentorId: student.mentorId });
    const exams = await Exam.find({ mentorId: student.mentorId }).select('courseId');
    const studentResults = await Result.find({ studentId }).populate({ path: 'examId', select: 'courseId title' }).lean();

    const totalExamsByCourse = exams.reduce((acc, exam) => {
      const courseId = exam.courseId?.toString();
      if (!courseId) return acc;
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {});

    const progressByCourse = studentResults.reduce((acc, result) => {
      const courseId = result.examId?.courseId?.toString();
      if (!courseId) return acc;

      if (!acc[courseId]) {
        acc[courseId] = {
          scoreSum: 0,
          scoreCount: 0,
          examIds: new Set(),
          latestScore: 0,
          latestDate: new Date(0),
        };
      }

      const entry = acc[courseId];
      entry.scoreSum += result.score;
      entry.scoreCount += 1;
      if (result.examId?._id) {
        entry.examIds.add(result.examId._id.toString());
      }

      const resultDate = result.createdAt ? new Date(result.createdAt) : new Date(0);
      if (resultDate > entry.latestDate) {
        entry.latestDate = resultDate;
        entry.latestScore = result.score;
      }

      return acc;
    }, {});

    const coursesWithProgress = courses.map((course) => {
      const courseId = course._id.toString();
      const totalExams = totalExamsByCourse[courseId] || 0;
      const progressEntry = progressByCourse[courseId] || null;
      const completedExams = progressEntry ? progressEntry.examIds.size : 0;
      const avgScore = progressEntry ? Math.round(progressEntry.scoreSum / progressEntry.scoreCount) : 0;
      const latestScore = progressEntry ? progressEntry.latestScore : 0;
      const progress = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : avgScore;

      return {
        ...course.toObject(),
        progress,
        completedExams,
        totalExams,
        lessonsLeft: Math.max(totalExams - completedExams, 0),
        avgScore,
        latestScore,
      };
    });

    res.json({ success: true, courses: coursesWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Videos
exports.getVideos = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const videos = await Resource.find({ mentorId: student.mentorId, type: 'video' });
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available exams
exports.getExams = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const exams = await Exam.find({ mentorId: student.mentorId }).populate('courseId');

    // Normalize any legacy exams with missing metadata
    await Promise.all(exams.map(async (exam) => {
      let hasChanges = false;
      if (!exam.timeLimit || exam.timeLimit <= 0) {
        exam.timeLimit = 10;
        hasChanges = true;
      }
      if (!exam.questionCount || exam.questionCount <= 0) {
        const count = await Question.countDocuments({ examId: exam._id });
        if (count > 0) {
          exam.questionCount = count;
          hasChanges = true;
        }
      }
      if (hasChanges) {
        await exam.save();
      }
    }));

    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get questions for an exam
exports.getExamQuestions = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { examId } = req.params;
    const questions = await Question.find({ examId });
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start Exam
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId).populate('courseId');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const questions = await Question.find({ examId: exam._id });
    let hasChanges = false;
    if (!exam.timeLimit || exam.timeLimit <= 0) {
      exam.timeLimit = 10;
      hasChanges = true;
    }
    if (!exam.questionCount || exam.questionCount !== questions.length) {
      exam.questionCount = questions.length;
      hasChanges = true;
    }
    if (hasChanges) {
      await exam.save();
    }

    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Exam (SECURE VERSION)
exports.submitExam = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { examId, answers, timeSpent } = req.body; // answers is an object: { questionId: selectedOption }
    if (!examId || !answers) {
      return res.status(400).json({ success: false, message: 'Exam ID and answers are required' });
    }

    const student = await User.findById(studentId);
    const questions = await Question.find({ examId });

    if (!questions.length) {
      return res.status(400).json({ success: false, message: 'No questions found for this exam' });
    }

    let correctCount = 0;
    questions.forEach(q => {
      const studentAnswer = answers[q._id.toString()];
      if (studentAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const totalQuestions = questions.length;

    const existingResult = await Result.findOne({ studentId, examId });
    const attempt = existingResult ? existingResult.attempt + 1 : 1;

    const result = new Result({
      studentId,
      examId,
      adminId: student.adminId || null,
      score,
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      timeSpent: timeSpent || "0:00",
      attempt
    });

    await result.save();

    // Create notification for mentor
    const Notification = require('../models/Notification');
    const exam = await Exam.findById(examId).populate('courseId', 'title');
    const mentor = student.mentorId;
    
    if (mentor) {
      await Notification.create({
        mentorId: mentor,
        type: 'exam_attended',
        title: `Student ${student.name} Completed Exam`,
        message: `${student.name} completed ${exam?.title || 'Exam'} with score ${score}%`,
        studentId: studentId,
        examId: examId,
        courseId: exam?.courseId?._id,
        isRead: false,
      });
    }

    // Update student's marks array (for legacy support in some controllers)
    student.marks.push({
      examName: exam ? exam.title : 'Unknown Exam',
      score,
      totalMarks: 100,
      date: new Date()
    });
    await student.save();

    res.json({
      success: true,
      message: `Exam submitted! You scored ${score}%`,
      result: { score, correctCount, totalQuestions: questions.length }
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate Exam for a Course
exports.generateExam = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Verify student has access to this course (same mentor)
    if (course.mentorId.toString() !== student.mentorId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this course' });
    }

    let exam = await Exam.findOne({ courseId: course._id, mentorId: course.mentorId }).sort({ createdAt: -1 });

    if (!exam) {
      exam = new Exam({
        title: `${course.title} - Assessment`,
        courseId: course._id,
        mentorId: course.mentorId,
        adminId: student.adminId,
        timeLimit: 10,
        questionCount: 5,
        difficulty: 'Medium'
      });
      await exam.save();
    }

    let questions = await Question.find({ examId: exam._id });

    if (!questions.length) {
      const requestedCount = Math.max(1, Number(exam.questionCount) || 5);
      questions = await generateQuestionsForCourse(course, exam._id, student.adminId, requestedCount);
    }

    let shouldUpdateExam = false;
    if (!exam.timeLimit || exam.timeLimit <= 0) {
      exam.timeLimit = 10;
      shouldUpdateExam = true;
    }
    if (!exam.questionCount || exam.questionCount !== questions.length) {
      exam.questionCount = questions.length;
      shouldUpdateExam = true;
    }
    if (shouldUpdateExam) {
      await exam.save();
    }

    res.json({
      success: true,
      exam,
      questions: questions.length,
      message: `Exam ready with ${questions.length} questions`
    });
  } catch (error) {
    console.error("Generate Exam Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate questions based on course content
async function generateQuestionsForCourse(course, examId, adminId, desiredCount = 5) {
  const questions = [];
  const safeCount = Math.max(1, Number(desiredCount) || 5);

  const createFallbackQuestions = async () => {
    if (course.title && course.description) {
      const question1 = new Question({
        examId,
        adminId,
        question: `What is the main topic covered in '${course.title}'?`,
        options: [
          course.description,
          "Advanced programming concepts",
          "Database management",
          "Web development"
        ],
        correctAnswer: course.description,
        difficulty: 'Medium'
      });
      await question1.save();
      questions.push(question1);

      const question2 = new Question({
        examId,
        adminId,
        question: `Which of the following is most aligned with '${course.title}'?`,
        options: [
          course.description,
          "Machine learning algorithms",
          "Network security",
          "Cloud computing"
        ],
        correctAnswer: course.description,
        difficulty: 'Medium'
      });
      await question2.save();
      questions.push(question2);
    }

    if (course.notes && questions.length < safeCount) {
      const noteExcerpt = course.notes.substring(0, 60) + "...";
      const question3 = new Question({
        examId,
        adminId,
        question: `Based on the notes for '${course.title}', which statement is true?`,
        options: [
          noteExcerpt,
          "No additional information is provided",
          "The course is about contact details",
          "It describes the grading policy"
        ],
        correctAnswer: noteExcerpt,
        difficulty: 'Medium'
      });
      await question3.save();
      questions.push(question3);
    }

    if (questions.length === 0) {
      const question4 = new Question({
        examId,
        adminId,
        question: `What is the primary goal of studying '${course.title}'?`,
        options: [
          "To gain knowledge and skills",
          "To complete assignments",
          "To pass exams",
          "To get certification"
        ],
        correctAnswer: "To gain knowledge and skills",
        difficulty: 'Easy'
      });
      await question4.save();
      questions.push(question4);
    }

    return questions;
  };

  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return createFallbackQuestions();
    }

    const promptParts = [
      `Course Title: ${course.title || 'N/A'}`,
      `Description: ${course.description || 'N/A'}`,
      `Notes: ${course.notes || 'N/A'}`,
      `Attachments: ${Array.isArray(course.attachments) && course.attachments.length > 0 ? course.attachments.join(', ') : 'None'}`,
      `Create ${safeCount} multiple-choice questions based on the information above.`,
      "Return the output as valid JSON array with fields: question, options (array), correctAnswer, difficulty."
    ];

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${apiKey}`,
      {
        prompt: {
          text: promptParts.join('\n')
        },
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 400,
        topP: 0.8,
        topK: 40
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const aiText = response.data?.candidates?.[0]?.output || '';
    let aiQuestions = [];

    try {
      const jsonMatch = aiText.match(/\[.*\]/s);
      aiQuestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiText);
    } catch (parseError) {
      console.error('AI question parse failed:', parseError, aiText);
      return createFallbackQuestions();
    }

    if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
      return createFallbackQuestions();
    }

    for (const q of aiQuestions.slice(0, safeCount)) {
      if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) continue;
      const newQuestion = new Question({
        examId,
        adminId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || 'Medium'
      });
      await newQuestion.save();
      questions.push(newQuestion);
    }

    if (questions.length === 0) {
      return createFallbackQuestions();
    }

    return questions;
  } catch (error) {
    console.error('AI question generation failed:', error.message || error);
    return createFallbackQuestions();
  }
}

// Get Results
exports.getResults = async (req, res) => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const results = await Result.find({ studentId })
      .populate('examId', 'title courseId')
      .sort({ createdAt: -1 })
      .lean();

    // Ensure all results have the required fields
    const enrichedResults = results.map(result => ({
      ...result,
      score: result.score || 0,
      correctAnswers: result.correctAnswers || 0,
      totalQuestions: result.totalQuestions || 0,
      timeSpent: result.timeSpent || "0:00"
    }));

    res.json({ success: true, results: enrichedResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

