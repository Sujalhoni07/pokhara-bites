const config = require("./config/env"); // load and check .env first
const app = require("./app");
const db = require("./database/db");

async function start() {
  // Stop early, with a clear message, if PostgreSQL is not reachable
  try {
    await db.checkConnection();
    console.log("✔ Connected to PostgreSQL");
  } catch (err) {
    console.error(`✖ Could not connect to PostgreSQL: ${err.message}`);
    console.error("Is PostgreSQL running, and is DATABASE_URL in .env correct?");
    process.exit(1);
  }

  app.listen(config.port, (err) => {
    if (err) {
      console.error(`Could not start the server on port ${config.port}: ${err.message}`);
      console.error("Is another server already running? Stop it and try again.");
      process.exit(1);
    }
    console.log(`API running on http://localhost:${config.port}`);
  });
}

start();