const express = require("express");

const router = express.Router();

const {
  createIncident,
  getIncidentById,
} = require("../controller/incidentController");

const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, require("../middleware/validateReport")("incident"), createIncident);

router.get("/:id", authenticateToken, getIncidentById);

module.exports = router;
