const bcrypt = require("bcrypt");
const pool = require("../config/db");

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (
      ![email, password, firstName, lastName, role].every(
        (value) => typeof value === "string" && value.trim(),
      )
    ) {
      return res.status(400).json({
        error: "All fields must be nonempty text.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedRole = role.trim().toLowerCase();

    if (!["admin", "employee"].includes(normalizedRole)) {
      return res.status(400).json({
        error: "Invalid role.",
      });
    }

    const existingUser = await pool.query(
      `
        SELECT user_id
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          role
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          user_id,
          email,
          first_name,
          last_name,
          role
      `,
      [
        normalizedEmail,
        passwordHash,
        firstName.trim(),
        lastName.trim(),
        normalizedRole,
      ],
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  createUser,
};
