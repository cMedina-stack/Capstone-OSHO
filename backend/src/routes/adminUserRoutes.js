// src/routes/adminUserRoutes.js
const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const { createUser } = require("../controller/adminUserController");

router.post("/", authenticateToken, requireRole("admin"), createUser);

module.exports = router;
