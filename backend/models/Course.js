const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeUrl: { type: String },
  notes: { type: String },
  attachments: [{ type: String }], // Array of file URLs or paths
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created the mentor
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);