const db = require("../../database/db");
const { PG_ERRORS, isUuid } = require("../../database/errors");

/**
 * Data access for user accounts (customers and the admin).
 * The only file that writes SQL for the users table.
 */

const COLUMNS = "id, name, email, phone, password_hash, role, created_at";

// Database row (snake_case) → object for our code (camelCase)
function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

async function findByEmail(email) {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM users WHERE email = $1`, [email]);
  return toUser(rows[0]);
}

async function findById(id) {
  if (!isUuid(id)) return null;
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return toUser(rows[0]);
}

// Returns the new customer, or null if the email is already taken
async function create({ name, email, phone, passwordHash }) {
  try {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING ${COLUMNS}`,
      [name, email, phone, passwordHash]
    );
    return toUser(rows[0]);
  } catch (err) {
    if (err.code === PG_ERRORS.UNIQUE_VIOLATION) return null;
    throw err;
  }
}

module.exports = { findByEmail, findById, create };