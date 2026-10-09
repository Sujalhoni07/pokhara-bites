import { apiRequest } from "./client";

/* Admin authentication (backend: /api/auth) */

export function login(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export function getCurrentAdmin() {
  return apiRequest("/api/auth/me");
}