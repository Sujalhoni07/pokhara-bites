const rateLimit = require("express-rate-limit");

/**
 * Blocks brute-force password guessing.
 * 5 failed login attempts per IP, then wait 15 minutes.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

/**
 * Stops spam on public forms (sign up, reservations).
 * 10 submissions per IP per hour.
 */
const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

module.exports = { loginLimiter, publicFormLimiter };