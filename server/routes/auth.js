const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuth, COOKIE_NAME } = require("../middleware/requireAuth");

const router = express.Router();

/* ---------------------------------------------------------
   The admin account comes from .env for now.
   TODO (backend team): replace findAdminByEmail() with a
   database query. Nothing else in this file needs to change.
--------------------------------------------------------- */
function findAdminByEmail(email) {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();

  if (email !== adminEmail) return null;

  return {
    id: 1,
    email: adminEmail,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    role: "admin",
  };
}

const TOKEN_LIFETIME = "8h";

const cookieOptions = {
  httpOnly: true, // JavaScript on the page cannot read it
  sameSite: "lax", // basic CSRF protection
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const admin = findAdminByEmail(String(email).trim().toLowerCase());

  // Same message for a wrong email and a wrong password,
  // so nobody can find out which emails exist.
  const passwordOk =
    admin && (await bcrypt.compare(String(password), admin.passwordHash));

  if (!admin || !passwordOk) {
    return res.status(401).json({ message: "Wrong email or password." });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_LIFETIME }
  );

  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ admin: { email: admin.email, role: admin.role } });
});

/* POST /api/auth/logout */
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: "Logged out." });
});

/* GET /api/auth/me  (protected) */
router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;