const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smarteval_jwt_secret_key_2025";
const FALLBACK_ADMIN = {
  _id: "fallback-admin",
  name: "System Admin",
  email: "admin@skillmatrix.ai",
  password: bcrypt.hashSync("admin123", 10),
  role: "admin",
};

const ALLOWED_FALLBACK_EMAILS = new Set([
  FALLBACK_ADMIN.email,
  "admin@smarteval.ai",
  "adminname@gmail.com",
  "admin@gmail.com",
]);

async function authenticateLogin({ email, password, isDbReady = mongoose.connection.readyState === 1 }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "").trim();

  console.log("🔐 Login attempt with email:", normalizedEmail);

  if (!normalizedEmail || !normalizedPassword) {
    return { success: false, statusCode: 400, message: "Email and password are required" };
  }

  if (!isDbReady) {
    if (!ALLOWED_FALLBACK_EMAILS.has(normalizedEmail)) {
      console.log("❌ Fallback auth: user not found with email:", normalizedEmail);
      return { success: false, statusCode: 400, message: "Invalid email or account not found. Try admin@skillmatrix.ai or adminname@gmail.com with admin123." };
    }

    const isMatch = await bcrypt.compare(normalizedPassword, FALLBACK_ADMIN.password);
    if (!isMatch) {
      console.log("❌ Fallback auth: password mismatch for user:", FALLBACK_ADMIN.email);
      return { success: false, statusCode: 400, message: "Incorrect password for this account. Use admin123 for the default admin account." };
    }

    const token = jwt.sign({ id: FALLBACK_ADMIN._id, role: FALLBACK_ADMIN.role }, JWT_SECRET, { expiresIn: "1d" });
    return {
      success: true,
      token,
      user: {
        id: FALLBACK_ADMIN._id,
        name: FALLBACK_ADMIN.name,
        email: FALLBACK_ADMIN.email,
        role: FALLBACK_ADMIN.role,
      },
    };
  }

  const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });

  if (!user) {
    console.log("❌ User not found with email:", normalizedEmail);
    return { success: false, statusCode: 400, message: "Invalid email or account not found" };
  }

  console.log("✅ User found:", user.email);

  const isMatch = await bcrypt.compare(normalizedPassword, user.password);
  console.log("🔑 Password match result:", isMatch);

  if (!isMatch) {
    console.log("❌ Password mismatch for user:", user.email);
    return { success: false, statusCode: 400, message: "Incorrect password for this account" };
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

  console.log("✅ Login successful for user:", user.email);
  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  };
}

router.post("/login", async (req, res) => {
  try {
    const result = await authenticateLogin({
      email: req.body?.email,
      password: req.body?.password,
      isDbReady: mongoose.connection.readyState === 1,
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json({ success: false, message: result.message });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

async function registerUser({ name, email, password, role = "admin", adminId = null, isDbReady = mongoose.connection.readyState === 1 }) {
  const validRoles = ["admin", "mentor", "student"];
  const userRole = role && validRoles.includes(role) ? role : "admin";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      statusCode: 400,
      message: "Valid email address required (any domain accepted)",
    };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return {
      success: false,
      statusCode: 400,
      message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
    };
  }

  if (!name || name.trim().length < 2) {
    return {
      success: false,
      statusCode: 400,
      message: "Name must be at least 2 characters",
    };
  }

  if (!isDbReady) {
    const token = jwt.sign({ id: `fallback-${email}`, role: userRole }, JWT_SECRET, { expiresIn: "1d" });
    return {
      success: true,
      token,
      user: {
        id: `fallback-${email}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: userRole,
      },
    };
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    return {
      success: false,
      statusCode: 400,
      message: "Email already in use",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: userRole,
    ...(adminId ? { adminId } : {}),
  });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

  console.log(`✅ ${userRole.toUpperCase()} registered successfully:`, email);

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

router.post("/register", async (req, res) => {
  try {
    const result = await registerUser({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
      role: req.body?.role,
      adminId: req.body?.adminId || null,
      isDbReady: mongoose.connection.readyState === 1,
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json({ success: false, message: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
module.exports.authenticateLogin = authenticateLogin;
module.exports.registerUser = registerUser;
