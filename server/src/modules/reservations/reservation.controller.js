const reservationService = require("./reservation.service");

// The fields customers see (no internal userId)
function toPublic(reservation) {
  return {
    id: reservation.id,
    code: reservation.code,
    name: reservation.name,
    phone: reservation.phone,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    note: reservation.note,
    status: reservation.status,
    createdAt: reservation.createdAt,
  };
}

/* ----- customer ----- */

// POST /api/reservations
async function create(req, res) {
  const reservation = await reservationService.createReservation(req.user.id, req.body);
  res.status(201).json({ reservation: toPublic(reservation) });
}

// GET /api/reservations/mine
async function listMine(req, res) {
  const reservations = await reservationService.listForUser(req.user.id);
  res.json({ reservations: reservations.map(toPublic) });
}

// PATCH /api/reservations/mine/:id/cancel
async function cancelMine(req, res) {
  const reservation = await reservationService.cancelForUser(req.user.id, req.params.id);
  res.json({ reservation: toPublic(reservation) });
}

/* ----- admin ----- */

// GET /api/reservations
async function listAll(req, res) {
  const reservations = await reservationService.listAll();
  res.json({ reservations });
}

// PATCH /api/reservations/:id/status
async function updateStatus(req, res) {
  const reservation = await reservationService.changeStatus(req.params.id, req.body.status);
  res.json({ reservation });
}

module.exports = { create, listMine, cancelMine, listAll, updateStatus };