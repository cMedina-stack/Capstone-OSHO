const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;

const userRoutes = require("./routes/userRoutes");
const hazardRoutes = require("./routes/hazardRoutes");
const buildingRoutes = require("./routes/buildingRoutes");
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const hazardAssessmentRoutes = require("./routes/hazardAssessmentRoutes");
const incidentAssessmentRoutes = require("./routes/incidentAssessmentRoutes");

const quickReviewRoutes = require("./routes/quickReviewRoutes");
const adminAssessmentRoutes = require("./routes/adminAssessmentRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

// ============================================================
// SERVE REACT FRONTEND IN PRODUCTION
// ============================================================

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../dist");

  // Serve React/Vite static files
  app.use(express.static(frontendPath));

  // React Router fallback
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) {
      return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ error: "A JSON object is required." });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "OSHO Backend API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

console.log("adminUserRoutes:", typeof adminUserRoutes, adminUserRoutes);

app.use("/api/users", userRoutes);
app.use("/api/hazards", hazardRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/hazard-assessments", hazardAssessmentRoutes);
app.use("/api/incident-assessments", incidentAssessmentRoutes);

app.use("/api/quick-reviews", quickReviewRoutes);
app.use("/api/admin-assessments", adminAssessmentRoutes);
app.use("/api/admin/users", adminUserRoutes);

const exportRoutes = require("./routes/exportRoutes");

app.use("/api/admin/exports", exportRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  const status =
    err.status || (["22P02", "23503", "23514"].includes(err.code) ? 400 : 500);
  res.status(status).json({
    error:
      status === 400
        ? "Invalid request data."
        : "Unable to complete the request. Please try again.",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "OSHO API is running",
  });
});

module.exports = app;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OSHO server running on port ${PORT}`);
});
