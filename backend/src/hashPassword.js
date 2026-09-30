const bcrypt = require("bcrypt");
const pool = require("./config/db");

const hashPassword = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const resutl = await pool.query(
      `INSERT INTO users ( email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        normalizedRole,
        true,
      ],
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: resutl.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = hashPassword;
