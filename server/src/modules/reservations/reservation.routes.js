const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { publicFormLimiter } = require("../../middleware/rateLimit");
const { requireAuth, requireRole } = require("../../middleware/requireAuth");
const {
  validateCreateReservation,
  validateStatusUpdate,
} = require("./reservation.validation");
const controller = require("./reservation.controller");

const router = express.Router();

const customerOnly = [requireAuth, requireRole("customer")];
const adminOnly = [requireAuth, requireRole("admin")];

/* ----- customer ----- */

// POST /api/reservations
router.post(
  "/",
  ...customerOnly,
  publicFormLimiter,
  validate(validateCreateReservation),
  asyncHandler(controller.create)
);

// GET /api/reservations/mine
router.get("/mine", ...customerOnly, asyncHandler(controller.listMine));

// PATCH /api/reservations/mine/:id/cancel
router.patch("/mine/:id/cancel", ...customerOnly, asyncHandler(controller.cancelMine));

/* ----- admin ----- */

// GET /api/reservations
router.get("/", ...adminOnly, asyncHandler(controller.listAll));

// PATCH /api/reservations/:id/status
router.patch(
  "/:id/status",
  ...adminOnly,
  validate(validateStatusUpdate),
  asyncHandler(controller.updateStatus)
);

module.exports = router;