const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
app.locals.dbReady = false;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ CORS CONFIG (FIXED) - Support both development and production
const FRONTEND_URL = process.env.CLIENT_URL || "https://smart-skill-ai.vercel.app";
const allowedOrigins = [
  FRONTEND_URL,
  // Common local development URLs
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3001",
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin (like mobile apps, curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // Allow any Vercel preview/production deployment for this project
    const isVercelPreview = /^https:\/\/smart-skill-ai(-[a-z0-9]+-[a-z0-9]+)?\.vercel\.app$/.test(normalizedOrigin);

    // Check if origin is allowed
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      isVercelPreview ||
      /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin)
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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Create Default Admin
async function createDefaultAdmin() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

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
const adminRoutes = require("./routes/admin");
const mentorRoutes = require("./routes/mentor");
const studentRoutes = require("./routes/student");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes); // Support frontend calls that omit the /api prefix
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);

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
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartskillai";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    app.locals.dbReady = true;

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
    app.locals.dbReady = false;
    console.warn("Starting backend in fallback mode without MongoDB. Default admin login remains available.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (fallback mode)`);
    });
  });

// ✅ Handle crashes (VERY IMPORTANT)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});