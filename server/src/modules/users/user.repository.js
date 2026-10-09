const crypto = require("crypto");
const { createStore } = require("../../database/jsonStore");

/**
 * Data access for customer accounts.
 * Today: server/data/users.json
 * TODO (backend team): replace with database queries,
 * keeping the same function names and return values.
 */
const store = createStore("users");

async function findByEmail(email) {
  const users = await store.readAll();
  return users.find((user) => user.email === email) || null;
}

async function findById(id) {
  const users = await store.readAll();
  return users.find((user) => user.id === id) || null;
}

// Returns the new user, or null if the email is already taken
async function create({ name, email, phone, passwordHash }) {
  return store.update((users) => {
    if (users.some((user) => user.email === email)) {
      return { items: users, result: null };
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      passwordHash,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    return { items: [...users, user], result: user };
  });
}

module.exports = { findByEmail, findById, create };