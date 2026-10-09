import { apiRequest } from "./client";

/* Admin-only endpoints (backend: /api/admin) */

export function getSummary() {
  return apiRequest("/api/admin/summary");
}