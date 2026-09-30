const express = require("express");
const router = express.Router();

const {
  createHazard,
  getMyRecentHazards,
} = require("../controller/hazardController");

const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, require("../middleware/validateReport")("hazard"), createHazard);

router.get("/my-recent", authenticateToken, getMyRecentHazards);

module.exports = router;
