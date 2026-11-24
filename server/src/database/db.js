const { Pool, types } = require("pg");
const config = require("../config/env");

/*
 * By default, pg turns a DATE column into a JavaScript Date at midnight
 * in the SERVER's time zone, which can shift the day by one.
 * We keep dates as plain text ("2026-12-01") and times as "18:30".
 */
const DATE_OID = 1082;
const TIME_OID = 1083;
types.setTypeParser(DATE_OID, (value) => value);
types.setTypeParser(TIME_OID, (value) => value.slice(0, 5));

/*
 * A pool keeps a few connections open and reuses them,
 * instead of opening a new connection for every request (slow).
 */
const pool = new Pool({
  connectionString: config.db.url,
  max: 10,
});

// An idle connection broke (for example, the database restarted)
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

/**
 * Run one SQL query.
 * ALWAYS pass values in `params` ($1, $2 …), never inside the SQL text.
 * This is what protects us from SQL injection.
 */
function query(text, params = []) {
  return pool.query(text, params);
}

// Used at startup and by /api/health
async function checkConnection() {
  await pool.query("SELECT 1");
}

module.exports = { pool, query, checkConnection };