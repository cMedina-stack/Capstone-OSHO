const express = require("express");

const router = express.Router();

const { getQuickReviews } = require("../controller/quickReviewController");

const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, require("../middleware/requireRole")("admin"), getQuickReviews);

module.exports = router;
