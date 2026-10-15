/* Date and time helpers, always in the user's local time (Nepal) */

// "18:30" → "6:30 PM"
export function formatTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// "2026-10-10" → "Sat, 10 Oct 2026"
export function formatDate(dateString) {
  return new Date(`${dateString}T00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// a Date → "2026-10-15" (local, not UTC)
export function toDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// is the booking still in the future?
export function isUpcoming(reservation) {
  return new Date(`${reservation.date}T${reservation.time}`) > new Date();
}