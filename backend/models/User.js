const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobile: { type: String },
  department: { type: String, default: "General" },
  subject: { type: String, default: "" },
  bio: { type: String, default: "" },
  role: { type: String, enum: ["admin", "mentor", "student"], required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For students
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For mentors and students
  marks: [
    {
      examName: { type: String },
      score: { type: Number },
      totalMarks: { type: Number, default: 100 },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("User", userSchema);