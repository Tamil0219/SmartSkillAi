const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["exam_attended", "course_added", "reminder"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model("Notification", notificationSchema);
