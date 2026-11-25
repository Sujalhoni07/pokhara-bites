/**
 * Creates the admin account, or resets its password if it already exists.
 *
 *   npm run db:create-admin -- "admin@pokharabites.com" "StrongPassword123"
 */
const bcrypt = require("bcryptjs");
const { pool } = require("../src/database/db");

const SALT_ROUNDS = 10;

async function createAdmin() {
  const email = (process.argv[2] || "").trim().toLowerCase();
  const password = process.argv[3] || "";

  if (!email || !password) {
    console.log('Usage: npm run db:create-admin -- "admin@example.com" "StrongPassword123"');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8 || password.length > 72) {
    console.log("The password must be 8 to 72 characters.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert, or if the email exists: make it an admin and set the new password
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Café Admin', $1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           updated_at = now()`,
    [email, passwordHash]
  );

  console.log(`✔ Admin account ready: ${email}`);
}

createAdmin()
  .catch((err) => {
    console.error("✖ Could not create the admin:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());