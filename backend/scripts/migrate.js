const fs = require("node:fs");
const path = require("node:path");
const pool = require("../src/config/db");
(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    await client.query("LOCK TABLE schema_migrations IN EXCLUSIVE MODE");
    for (const name of fs
      .readdirSync(path.join(__dirname, "../migrations"))
      .filter((n) => n.endsWith(".sql"))
      .sort()) {
      if (
        (
          await client.query("SELECT 1 FROM schema_migrations WHERE name=$1", [
            name,
          ])
        ).rowCount
      )
        continue;
      await client.query(
        fs.readFileSync(path.join(__dirname, "../migrations", name), "utf8"),
      );
      await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
        name,
      ]);
      console.log(`Applied ${name}`);
    }
    await client.query("COMMIT");
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
