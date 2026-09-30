const express = require("express");
const router = express.Router();

// Import the controller function
const hashPassword = require("../controller/hashPassword");

// Assign the controller to the route
router.post("/batch-register", require("../middleware/auth"), require("../middleware/requireRole")("admin"), hashPassword);

module.exports = router;
