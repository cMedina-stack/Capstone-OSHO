const bcrypt = require("bcrypt");
const pool = require("../config/db");

// ============================================================
// GET USER ID FROM JWT
// ============================================================

const getUserId = (req) => {
  return req.user?.user_id || req.user?.userId || req.user?.id;
};

// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { firstName, lastName, email } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "First name, last name, and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if another user already uses this email
    const existingEmail = await pool.query(
      `
        SELECT user_id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        AND user_id <> $2
      `,
      [normalizedEmail, userId],
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        message: "That email address is already being used.",
      });
    }

    // Update profile
    const result = await pool.query(
      `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          email = $3
        WHERE user_id = $4
        RETURNING
          user_id,
          first_name,
          last_name,
          email,
          role
      `,
      [firstName.trim(), lastName.trim(), normalizedEmail, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error while updating profile.",
    });
  }
};
// ============================================================
// CHANGE PASSWORD
// ============================================================

const changePassword = async (req, res) => {
  try {
    const userId = getUserId(req);

    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    const result = await pool.query(
      `
        SELECT user_id, password_hash
        FROM users
        WHERE user_id = $1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (samePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      `
    UPDATE users
    SET password_hash = $1
    WHERE user_id = $2
  `,
      [passwordHash, userId],
    );
    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Server error while changing password.",
    });
  }
};

module.exports = {
  updateProfile,
  changePassword,
};
