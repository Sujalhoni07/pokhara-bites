const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

/* Stop early if an important setting is missing */
const REQUIRED = ["JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "CLIENT_URL"];
const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

/**
 * All settings in one place.
 * Other files import this instead of reading process.env directly.
 */
const config = {
  port: Number(process.env.PORT) || 4000,
  isProduction: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL,
    timezone: "Asia/Kathmandu", // the café's local time, used for "today"

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "8h",
  },

  cookie: {
    name: "pb_token",
    maxAgeMs: 8 * 60 * 60 * 1000, // 8 hours (same as the JWT)
  },

  admin: {
    email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  },
};

module.exports = config;