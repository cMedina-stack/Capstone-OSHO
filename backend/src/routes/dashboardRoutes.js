const express = require("express");

const router = express.Router();

const {
  getCampusSafetyAlerts,
  getAdminDashboard,
  getReportsByBuilding,
  getAdminAssessments,
} = require("../controller/dashboardController");

const authenticateToken = require("../middleware/auth");

router.get("/campus-alerts", authenticateToken, getCampusSafetyAlerts);

router.get("/admin", authenticateToken, require("../middleware/requireRole")("admin"), getAdminDashboard);

router.get("/reports-by-building", authenticateToken, require("../middleware/requireRole")("admin"), getReportsByBuilding);

router.get("/assessments", authenticateToken, require("../middleware/requireRole")("admin"), getAdminAssessments);

router.get("/analytics", authenticateToken, require("../middleware/requireRole")("admin"), require("../controller/analyticsController").getAnalytics);

module.exports = router;
