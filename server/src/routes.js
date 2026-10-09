const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const router = express.Router();

// GET /api/health
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes); // /api/auth/...
router.use("/admin", adminRoutes); // /api/admin/...

// TODO (backend team): mount new modules here, e.g.
// router.use("/orders", orderRoutes);

module.exports = router;