const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const { nowInCafe, addDays, weekdayOf } = require("../../utils/dateTime");
const reservationRepository = require("./reservation.repository");

const DAYS_AHEAD = 30;
const PREPARATION_HOURS = 0.5; // a table needs at least 30 minutes to prepare
const CANCELLABLE = ["pending", "confirmed"];

/* ----- helpers ----- */

// Saturday has different opening hours
function getOpeningHours(dateString) {
  const isSaturday = weekdayOf(dateString) === 6;
  return { open: isSaturday ? 8 : 7, close: isSaturday ? 22 : 21 };
}

function toHours(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour + minute / 60;
}

function isInPast(reservation) {
  const now = nowInCafe();
  if (reservation.date < now.date) return true;
  return reservation.date === now.date && toHours(reservation.time) <= now.hours;
}

// soonest first
function sortByDateTime(reservations) {
  return reservations.sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );
}

/* ----- customer ----- */

async function createReservation(userId, data) {
  const now = nowInCafe();
  const lastBookableDay = addDays(now.date, DAYS_AHEAD);

  if (data.date < now.date) {
    throw new AppError("Please choose today or a later date.", 400);
  }
  if (data.date > lastBookableDay) {
    throw new AppError(`We take bookings up to ${DAYS_AHEAD} days ahead.`, 400);
  }

  const slot = toHours(data.time);
  const { open, close } = getOpeningHours(data.date);

  // the last booking is 1 hour before closing
  if (slot < open || slot > close - 1) {
    throw new AppError("The café is closed at that time.", 400);
  }
  if (data.date === now.date && slot <= now.hours + PREPARATION_HOURS) {
    throw new AppError("This time is no longer available. Please choose another.", 400);
  }

  const code = "PB-R" + crypto.randomInt(10000, 100000);

  return reservationRepository.create({ ...data, userId, code });
}

async function listForUser(userId) {
  const reservations = await reservationRepository.findByUserId(userId);
  return sortByDateTime(reservations);
}

async function cancelForUser(userId, id) {
  const reservation = await reservationRepository.findById(id);

  // "not found" also when it belongs to someone else, so nothing is revealed
  if (!reservation || reservation.userId !== userId) {
    throw new AppError("Reservation not found.", 404);
  }
  if (!CANCELLABLE.includes(reservation.status)) {
    throw new AppError(`This reservation is already ${reservation.status}.`, 400);
  }
  if (isInPast(reservation)) {
    throw new AppError("Past reservations can't be cancelled.", 400);
  }

  return reservationRepository.updateStatus(id, "cancelled");
}

/* ----- admin ----- */

async function listAll() {
  const reservations = await reservationRepository.findAll();
  return sortByDateTime(reservations);
}

async function changeStatus(id, status) {
  const updated = await reservationRepository.updateStatus(id, status);
  if (!updated) {
    throw new AppError("Reservation not found.", 404);
  }
  return updated;
}

module.exports = {
  createReservation,
  listForUser,
  cancelForUser,
  listAll,
  changeStatus,
};