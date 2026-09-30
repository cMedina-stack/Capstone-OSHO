const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
(async () => {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const first = process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim();
  const last = process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim();
  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.length < 12 ||
    !first ||
    !last
  )
    throw new Error(
      "Provide a valid bootstrap email, password (12+ characters), first name, and last name.",
    );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE users IN EXCLUSIVE MODE");
    if (
      (await client.query("SELECT 1 FROM users WHERE role='admin' LIMIT 1"))
        .rowCount
    )
      throw new Error(
        "An administrator already exists. Use authenticated account management.",
      );
    await client.query(
      "INSERT INTO users(email,password_hash,first_name,last_name,role) VALUES($1,$2,$3,$4,'admin')",
      [email, await bcrypt.hash(password, 12), first, last],
    );
    await client.query("COMMIT");
    console.log("Initial administrator created.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
