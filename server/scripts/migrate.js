/**
 * Runs the SQL files in /migrations that have not been run yet.
 *
 *   npm run db:migrate
 *
 * Files run in name order (001_, 002_ …). Each finished file is recorded
 * in the schema_migrations table, so it never runs twice.
 * Each file runs inside a transaction: all of it works, or none of it is saved.
 */
const fs = require("fs");
const path = require("path");
const { pool } = require("../src/database/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const done = new Set(rows.map((row) => row.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const pending = files.filter((file) => !done.has(file));

    if (pending.length === 0) {
      console.log("✔ Database is up to date.");
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`✔ Applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`${file} failed: ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("✖ Migration failed:", err.message);
  process.exit(1);
});