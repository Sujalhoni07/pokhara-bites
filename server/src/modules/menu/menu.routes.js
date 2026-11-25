const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { requireAuth, requireRole } = require("../../middleware/requireAuth");
const { validateDish, validateAvailability } = require("./menu.validation");
const controller = require("./menu.controller");

const router = express.Router();
const adminOnly = [requireAuth, requireRole("admin")];

/* ----- admin (this must come BEFORE "/:id", or "admin" would be read as an id) ----- */

// GET /api/menu/admin
router.get("/admin", ...adminOnly, asyncHandler(controller.listForAdmin));

// POST /api/menu
router.post("/", ...adminOnly, validate(validateDish), asyncHandler(controller.create));

// PUT /api/menu/:id
router.put("/:id", ...adminOnly, validate(validateDish), asyncHandler(controller.update));

// PATCH /api/menu/:id/availability
router.patch(
  "/:id/availability",
  ...adminOnly,
  validate(validateAvailability),
  asyncHandler(controller.setAvailability)
);

/* ----- public: no login needed to see the menu ----- */

// GET /api/menu
router.get("/", asyncHandler(controller.list));

// GET /api/menu/:id
router.get("/:id", asyncHandler(controller.getOne));

module.exports = router;