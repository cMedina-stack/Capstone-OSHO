const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");

const {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentsByHazard,
  updateAssessment,
} = require("../controller/hazardAssessmentController");

router.post("/", authenticateToken, createAssessment);

router.get("/", authenticateToken, require("../middleware/requireRole")("admin"), getAllAssessments);

router.get("/hazard/:hazardId", authenticateToken, getAssessmentsByHazard);

router.get("/:id", authenticateToken, getAssessmentById);

router.put("/:id", authenticateToken, updateAssessment);

module.exports = router;
