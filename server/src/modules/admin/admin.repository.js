const config = require("../../config/env");

/**
 * Data access for admin accounts.
 * Today: one admin, read from .env.
 * TODO (backend team): replace with a database query.
 * Keep the same return shape, or null.
 */
async function findByEmail(email) {
  if (email !== config.admin.email) return null;

  return {
    id: "admin-1",
    name: "Café Admin",
    email: config.admin.email,
    passwordHash: config.admin.passwordHash,
    role: "admin",
  };
}

module.exports = { findByEmail };