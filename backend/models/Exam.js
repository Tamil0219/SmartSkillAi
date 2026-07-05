const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created the mentor
  timeLimit: { type: Number, default: 10 }, // in minutes
  questionCount: { type: Number, default: 5 },
  questions: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  completionDate: { type: Date }, // Deadline for exam completion
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exam', examSchema);