const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");

const { exportHazardAssessments } = require("../controller/exportController");

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required.",
    });
  }

  next();
};

router.get(
  "/hazard-assessments",
  authenticateToken,
  adminOnly,
  exportHazardAssessments,
);

module.exports = router;
