const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply middleware
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// ✅ DASHBOARD ROUTES
router.get('/dashboard', adminController.getDashboardOverview);

// ✅ MENTOR ROUTES
router.post('/mentors', adminController.createMentor);
router.get('/mentors', adminController.getMentors);
router.put('/mentors/:id', adminController.updateMentor);
router.delete('/mentors/:id', adminController.deleteMentor);

// ✅ STUDENT ROUTES
router.post('/students', adminController.createStudent);
router.get('/students', adminController.getStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/students/:studentId/marks', adminController.addStudentMarks);

// ✅ ANALYTICS ROUTES
router.get('/analytics', adminController.getPerformanceAnalytics);

// ✅ COURSES ROUTES
router.get('/courses', adminController.getCourses);

// ✅ PROFILE ROUTES
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);

module.exports = router;