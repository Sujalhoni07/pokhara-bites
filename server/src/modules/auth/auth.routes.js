const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { loginLimiter, publicFormLimiter } = require("../../middleware/rateLimit");
const { requireAuth } = require("../../middleware/requireAuth");
const { validateRegister, validateLogin } = require("./auth.validation");
const authController = require("./auth.controller");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  publicFormLimiter,
  validate(validateRegister),
  asyncHandler(authController.register)
);

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  validate(validateLogin),
  asyncHandler(authController.login)
);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET /api/auth/me
router.get("/me", requireAuth, asyncHandler(authController.me));

module.exports = router;