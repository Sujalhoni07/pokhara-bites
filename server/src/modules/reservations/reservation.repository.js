const crypto = require("crypto");
const { createStore } = require("../../database/jsonStore");

/**
 * Data access for reservations.
 * Today: server/data/reservations.json
 * TODO (backend team): replace with database queries,
 * keeping the same function names and return values.
 */
const store = createStore("reservations");

async function create(data) {
  return store.update((items) => {
    const reservation = {
      id: crypto.randomUUID(),
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    return { items: [...items, reservation], result: reservation };
  });
}

async function findAll() {
  return store.readAll();
}

async function findById(id) {
  const items = await store.readAll();
  return items.find((item) => item.id === id) || null;
}

async function findByUserId(userId) {
  const items = await store.readAll();
  return items.filter((item) => item.userId === userId);
}

// Returns the updated reservation, or null if it doesn't exist
async function updateStatus(id, status) {
  return store.update((items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return { items, result: null };

    const updated = {
      ...items[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    const nextItems = [...items];
    nextItems[index] = updated;
    return { items: nextItems, result: updated };
  });
}

module.exports = { create, findAll, findById, findByUserId, updateStatus };