const express = require("express");

const router = express.Router();

const {
  getAdminAssessments,
} = require("../controller/adminAssessmentController");

const authenticateToken = require("../middleware/auth");

// ============================================================
// ADMIN ASSESSMENTS
// ============================================================

router.get(
  "/",
  authenticateToken,
  require("../middleware/requireRole")("admin"),
  getAdminAssessments,
);

router.get(
  "/export",
  authenticateToken,
  require("../middleware/requireRole")("admin"),
  require("../controller/assessmentExportController").exportAssessments,
);

module.exports = router;
