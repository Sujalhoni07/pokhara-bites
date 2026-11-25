const db = require("../../database/db");
const { PG_ERRORS, isUuid } = require("../../database/errors");

/**
 * Data access for table reservations.
 * The only file that writes SQL for the reservations table.
 */

const COLUMNS = `id, code, user_id, name, phone, date, time, guests, note,
  status, created_at, updated_at`;

// soonest first
const ORDER = "ORDER BY date, time";

function toReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    date: row.date, // "2026-12-01"
    time: row.time, // "18:30"
    guests: row.guests,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Returns the new reservation, or null if the code is already used
async function create({ userId, code, name, phone, date, time, guests, note }) {
  try {
    const { rows } = await db.query(
      `INSERT INTO reservations (user_id, code, name, phone, date, time, guests, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [userId, code, name, phone, date, time, guests, note]
    );
    return toReservation(rows[0]);
  } catch (err) {
    if (err.code === PG_ERRORS.UNIQUE_VIOLATION) return null;
    throw err;
  }
}

async function findAll() {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM reservations ${ORDER}`);
  return rows.map(toReservation);
}

async function findById(id) {
  if (!isUuid(id)) return null;
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM reservations WHERE id = $1`, [id]);
  return toReservation(rows[0]);
}

async function findByUserId(userId) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM reservations WHERE user_id = $1 ${ORDER}`,
    [userId]
  );
  return rows.map(toReservation);
}

// Returns the updated reservation, or null if it doesn't exist
async function updateStatus(id, status) {
  if (!isUuid(id)) return null;
  const { rows } = await db.query(
    `UPDATE reservations
     SET status = $2, updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, status]
  );
  return toReservation(rows[0]);
}

module.exports = { create, findAll, findById, findByUserId, updateStatus };