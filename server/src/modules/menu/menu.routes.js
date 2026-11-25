const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const controller = require("./menu.controller");

const router = express.Router();

/* ----- public: no login needed to see the menu ----- */

// GET /api/menu
router.get("/", asyncHandler(controller.list));

// GET /api/menu/:id
router.get("/:id", asyncHandler(controller.getOne));

module.exports = router;