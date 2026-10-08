const jwt = require("jsonwebtoken");

const COOKIE_NAME = "pb_token";

/**
 * Protects a route.
 * Reads the JWT from the cookie, verifies it,
 * and puts the admin info on req.admin.
 */
function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Not logged in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

module.exports = { requireAuth, COOKIE_NAME };