import { apiRequest } from "./client";

/* Authentication for customers and the admin (backend: /api/auth) */

export function register({ name, email, phone, password }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, phone, password },
  });
}

export function login(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

// Who is logged in? Returns { user: { id, name, email, phone, role } }
export function getCurrentUser() {
  return apiRequest("/api/auth/me");
}