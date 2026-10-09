const express = require("express");
const { requireAuth, requireRole } = require("../../middleware/requireAuth");
const adminController = require("./admin.controller");

const router = express.Router();

// Every route in this file needs a logged-in admin
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/summary
router.get("/summary", adminController.getSummary);

module.exports = router;