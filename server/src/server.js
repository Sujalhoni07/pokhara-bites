const config = require("./config/env"); // load and check .env first
const app = require("./app");

app.listen(config.port, (err) => {
  if (err) {
    console.error(`Could not start the server on port ${config.port}: ${err.message}`);
    console.error("Is another server already running? Stop it and try again.");
    process.exit(1);
  }
  console.log(`API running on http://localhost:${config.port}`);
});