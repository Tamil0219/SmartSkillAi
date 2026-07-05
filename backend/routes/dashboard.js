const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Admin Dashboard
router.get('/admin/dashboard', async (req, res) => {
  try {
    const adminId = req.user?.id;
    console.log('[Admin Dashboard] req.user:', req.user);
    console.log('[Admin Dashboard] adminId:', adminId);
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin ID not found' });
    }
    
    const totalStudents = await User.countDocuments({ role: 'student', adminId });
    const totalMentors = await User.countDocuments({ role: 'mentor', adminId });
    
    // Count only courses and exams by mentors created by this admin
    const adminMentors = await User.find({ role: 'mentor', adminId }, '_id');
    const mentorIds = adminMentors.map(m => m._id);
    const totalCourses = await Course.countDocuments({ mentorId: { $in: mentorIds } });
    const totalExams = await Exam.countDocuments({ mentorId: { $in: mentorIds } });

    res.json({
      success: true,
      data: {
        students: totalStudents,
        mentors: totalMentors,
        courses: totalCourses,
        exams: totalExams,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Mentors
router.get('/admin/mentors', async (req, res) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin ID not found' });
    }
    
    const mentors = await User.find({ role: 'mentor', adminId }).select('-password');
    const mentorsWithCounts = await Promise.all(mentors.map(async (mentor) => {
      const coursesCount = await Course.countDocuments({ mentorId: mentor._id });
      const examsCount = await Exam.countDocuments({ mentorId: mentor._id });
      return {
        ...mentor.toObject(),
        coursesCount,
        examsCount,
        videosCount: 0,
      };
    }));
    res.json({ success: true, mentors: mentorsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Students
router.get('/admin/students', async (req, res) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin ID not found' });
    }
    
    const students = await User.find({ role: 'student', adminId }).select('-password');
    const studentsWithData = await Promise.all(students.map(async (student) => {
      const results = await Result.find({ studentId: student._id });
      const avgScore = results.length ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;
      return {
        ...student.toObject(),
        examsAttempted: results.length,
        averageScore: Math.round(avgScore),
      };
    }));
    res.json({ success: true, students: studentsWithData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Courses
router.get('/admin/courses', async (req, res) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin ID not found' });
    }
    
    // Get mentors created by this admin
    const adminMentors = await User.find({ role: 'mentor', adminId }, '_id');
    const mentorIds = adminMentors.map(m => m._id);
    
    // Get courses by those mentors
    const courses = await Course.find({ mentorId: { $in: mentorIds } });
    const coursesWithData = await Promise.all(courses.map(async (course) => {
      const mentor = await User.findById(course.mentorId);
      return {
        ...course.toObject(),
        mentorName: mentor ? mentor.name : 'Unknown',
      };
    }));
    res.json({ success: true, courses: coursesWithData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;