const express = require("express");

const router = express.Router();

const {
  getAllBuildings,
  getCampusMap,
  getBuildingReports,
} = require("../controller/buildingController");

const authenticateToken = require("../middleware/auth");

// ============================================================
// GET ALL BUILDINGS
// GET /api/buildings
// ============================================================

router.get("/", getAllBuildings);

// ============================================================
// GET CAMPUS MAP DATA
// GET /api/buildings/map
// ============================================================

router.get("/map", authenticateToken, getCampusMap);

// ============================================================
// GET REPORTS INSIDE A BUILDING
// GET /api/buildings/:buildingId/reports
// ============================================================

router.get("/:buildingId/reports", authenticateToken, getBuildingReports);

module.exports = router;
