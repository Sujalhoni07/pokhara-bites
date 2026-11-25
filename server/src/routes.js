const db = require("./database/db");
const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const reservationRoutes = require("./modules/reservations/reservation.routes");
const menuRoutes = require("./modules/menu/menu.routes");

const router = express.Router();

// GET /api/health  (is the API up, and can it reach the database?)
router.get("/health", async (req, res) => {
  try {
    await db.checkConnection();
    res.json({ status: "ok", database: "ok" });
  } catch {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

router.use("/auth", authRoutes); // /api/auth/...
router.use("/admin", adminRoutes); // /api/admin/...
router.use("/reservations", reservationRoutes); // /api/reservations/...
router.use("/menu", menuRoutes); // /api/menu/...

module.exports = router;