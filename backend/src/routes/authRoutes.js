const express = require("express");
const router = express.Router();

const { login } = require("../controller/loginController");

const authenticateToken = require("../middleware/auth");

const {
  updateProfile,
  changePassword,
} = require("../controller/profileController");

router.put("/profile", authenticateToken, updateProfile);

router.put("/change-password", authenticateToken, changePassword);

router.post("/login", login);

module.exports = router;
