const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mentorController = require('../controllers/mentorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer with custom storage to preserve filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExt);
    cb(null, fileName + '-' + uniqueSuffix + fileExt);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.pptx', '.ppt', '.jpg', '.jpeg', '.png', '.gif'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = express.Router();

// Apply middleware
router.use(authMiddleware);
router.use(roleMiddleware('mentor'));

// Mentor dashboard + analytics
router.get('/dashboard', mentorController.getDashboard);
router.get('/analytics', mentorController.getAnalytics);
router.get('/student-progress', mentorController.getStudentProgress);
router.get('/exam-overview', mentorController.getExamOverview);

// Students
router.get('/students', mentorController.getStudents);
router.get('/students/:studentId/performance', mentorController.getStudentPerformance);
router.post('/students', mentorController.addStudent);

// Courses
router.get('/courses', mentorController.getCourses);
router.post('/courses', mentorController.createCourse);
router.put('/courses/:id', mentorController.updateCourse);
router.delete('/courses/:id', mentorController.deleteCourse);
router.post('/courses/upload-attachment', upload.single('file'), mentorController.uploadAttachment);
router.post('/courses/generate-questions', upload.single('pdf'), mentorController.generateQuestionsFromPdf);

// Resources
router.get('/resources', mentorController.getResources);
router.post('/resources', mentorController.createResource);

// Exams
router.get('/exams', mentorController.getExams);
router.post('/exams', mentorController.createExam);

// Questions
router.get('/exams/:examId/questions', mentorController.getQuestions);
router.post('/questions', mentorController.createQuestion);

// Profile
router.get('/profile', mentorController.getProfile);
router.put('/profile', mentorController.updateProfile);

// Notifications
router.get('/notifications', mentorController.getNotifications);
router.get('/notifications/unread-count', mentorController.getUnreadCount);
router.put('/notifications/:notificationId/read', mentorController.markNotificationAsRead);

module.exports = router;
