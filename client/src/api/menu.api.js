import { apiRequest } from "./client";

/* The menu comes from OUR backend (PostgreSQL), not a test API */

// GET /api/menu → { categories: [{ id, name }], items: [...] }
export function getMenu() {
  return apiRequest("/api/menu");
}

// GET /api/menu/:id → { item }
export function getDish(id) {
  return apiRequest(`/api/menu/${id}`);
}