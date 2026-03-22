const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { staticUsers } = require("../utils/staticUsers");
const router = express.Router();

// Login - NO AUTH REQUIRED
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    // 1) Try static users first (no DB lookup for these credentials)
    let user = staticUsers.find(
      (u) => u.email === identifier || u.username === identifier,
    );
    let isStatic = Boolean(user);

    // 2) Fallback to DB users if not one of the predefined static users
    if (!user) {
      user = await User.findOne({ email: identifier });
      if (user) {
        isStatic = false;
      }
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const passwordHash = isStatic ? user.password : user.password;

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const tokenPayload = {
      id: isStatic ? user.id : user._id,
      email: user.email,
      role: user.role,
      static: isStatic,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "fallback_secret_key_123",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: tokenPayload.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
