const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply middleware
router.use(authMiddleware);
router.use(roleMiddleware('student'));

// Student routes
router.get('/dashboard', studentController.getDashboard);
router.get('/courses', studentController.getCourses);
router.get('/videos', studentController.getVideos);
router.get('/exams', studentController.getExams);
router.get('/exams/:examId/questions', studentController.getExamQuestions);
router.post('/start-exam', studentController.startExam);
router.post('/generate-exam', studentController.generateExam);
router.post('/submit-exam', studentController.submitExam);
router.get('/results', studentController.getResults);

module.exports = router;
