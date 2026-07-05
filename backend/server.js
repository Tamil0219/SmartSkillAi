const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ CORS CONFIG (FIXED)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin)
      ) {
        callback(null, true);
      } else {
        console.error("❌ CORS Error - Origin not allowed:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Create Default Admin
async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@skillmatrix.ai",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "System Admin",
      email: "admin@skillmatrix.ai",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Default Admin Created");
  } catch (err) {
    console.error("Admin creation error:", err);
  }
}

// ✅ Routes
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const mentorRoutes = require("./routes/mentor");
const studentRoutes = require("./routes/student");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", dashboardRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("SkillMatrix AI Backend Running 🚀");
});

// ✅ Error handler (FIXED)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS Error",
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ✅ Start server AFTER DB connect
const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/smartevalai"
  )
  .then(async () => {
    console.log("MongoDB Connected");

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

// ✅ Handle crashes (VERY IMPORTANT)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});