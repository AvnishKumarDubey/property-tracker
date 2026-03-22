const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { staticUsers } = require("../utils/staticUsers");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.static) {
      user = staticUsers.find(
        (u) => u.id === decoded.id || u.email === decoded.email,
      );
    } else {
      user = await User.findById(decoded.id);
      if (!user) {
        // If this was not a static user, attempt static fallback as precaution
        user = staticUsers.find(
          (u) => u.id === decoded.id || u.email === decoded.email,
        );
      }
    }

    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { auth, adminAuth };
