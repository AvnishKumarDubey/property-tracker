const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware - IMPORTANT ORDER!
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173", // Vite dev port
        "https://property-tracker-frontend.onrender.com",
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight requests explicitly
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));

// AUTH ROUTES FIRST (before auth middleware)
app.use("/api/auth", require("./routes/auth"));

// OTHER ROUTES (require authentication)
app.use("/api/properties", require("./routes/properties"));
app.use("/api/transactions", require("./routes/transactions"));

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/propertytracker",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);

process.on("SIGINT", async () => {
  console.log("🛑 Gracefully shutting down...");
  process.exit(0);
});
