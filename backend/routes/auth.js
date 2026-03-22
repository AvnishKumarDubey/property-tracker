const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Initialize predefined users (run once)
router.get("/me", async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: "admin@properties.com" });
    if (!adminExists) {
      const admin = new User({
        email: "admin@properties.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      });
      await admin.save();

      const user = new User({
        email: "user@properties.com",
        password: await bcrypt.hash("user123", 10),
        role: "user",
      });
      await user.save();

      console.log(
        "✅ Created admin@properties.com/admin123 & user@properties.com/user123",
      );
    }
    res.json({
      message:
        "Users ready! Use admin@properties.com/admin123 or user@properties.com/user123",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login - NO AUTH REQUIRED
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email); // Debug log

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Wrong password for:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret_key_123",
      {
        expiresIn: "7d",
      },
    );

    console.log("✅ Login success:", email, user.role);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
