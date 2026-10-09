/**
 * Format checks only (is the data the right shape?).
 * Business rules (opening hours, dates) live in the service.
 */

const PHONE_PATTERN = /^(98|97)\d{8}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:(00|30)$/;
const MAX_GUESTS = 20;

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCreateReservation(body) {
  const errors = [];

  const name = cleanText(body.name);
  const phone = cleanText(body.phone);
  const date = cleanText(body.date);
  const time = cleanText(body.time);
  const guests = Number(body.guests);
  const note = cleanText(body.note);

  if (name.length < 3 || name.length > 60) {
    errors.push("Name must be 3 to 60 characters.");
  }
  if (!PHONE_PATTERN.test(phone)) {
    errors.push("Phone must be 10 digits starting with 98 or 97.");
  }
  if (!DATE_PATTERN.test(date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }
  if (!TIME_PATTERN.test(time)) {
    errors.push("Time must be on the hour or half hour, like 18:30.");
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    errors.push(`Guests must be between 1 and ${MAX_GUESTS}.`);
  }
  if (note.length > 200) {
    errors.push("Note must be 200 characters or fewer.");
  }

  return { errors, value: { name, phone, date, time, guests, note } };
}

function validateStatusUpdate(body) {
  const status = cleanText(body.status);
  const errors = STATUSES.includes(status)
    ? []
    : [`Status must be one of: ${STATUSES.join(", ")}.`];

  return { errors, value: { status } };
}

module.exports = { validateCreateReservation, validateStatusUpdate, STATUSES };