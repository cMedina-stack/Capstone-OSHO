const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth");

const {
  createAssessment,
  getAssessmentById,
  getAssessmentsByIncident,
  updateAssessment,
} = require("../controller/incidentAssessmentController");

// ============================================================
// CREATE INCIDENT ASSESSMENT
// POST /api/incident-assessments
// ============================================================

router.post("/", authenticateToken, createAssessment);

// ============================================================
// GET ASSESSMENTS BY INCIDENT
// GET /api/incident-assessments/incident/:incidentId
// ============================================================

router.get(
  "/incident/:incidentId",
  authenticateToken,
  getAssessmentsByIncident,
);

// ============================================================
// GET SINGLE ASSESSMENT
// GET /api/incident-assessments/:id
// ============================================================

router.get("/:id", authenticateToken, getAssessmentById);

// ============================================================
// UPDATE ASSESSMENT
// PUT /api/incident-assessments/:id
// ============================================================

router.put("/:id", authenticateToken, updateAssessment);

module.exports = router;
