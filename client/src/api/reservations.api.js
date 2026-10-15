import { apiRequest } from "./client";

/* Reservations (backend: /api/reservations) */

/* ----- customer ----- */

export function createReservation({ name, phone, date, time, guests, note }) {
  return apiRequest("/api/reservations", {
    method: "POST",
    body: { name, phone, date, time, guests, note },
  });
}

export function getMyReservations() {
  return apiRequest("/api/reservations/mine");
}

export function cancelMyReservation(id) {
  return apiRequest(`/api/reservations/mine/${id}/cancel`, { method: "PATCH" });
}

/* ----- admin (used by the dashboard in Step 4) ----- */

export function getAllReservations() {
  return apiRequest("/api/reservations");
}

export function updateReservationStatus(id, status) {
  return apiRequest(`/api/reservations/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}