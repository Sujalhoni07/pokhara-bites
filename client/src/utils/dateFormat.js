/* Turn stored values into friendly text */

// "18:30" → "6:30 PM"
export function formatTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// "2026-10-10" → "Sat, 10 Oct 2026" (read as a local date, not UTC)
export function formatDate(dateString) {
  return new Date(`${dateString}T00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}