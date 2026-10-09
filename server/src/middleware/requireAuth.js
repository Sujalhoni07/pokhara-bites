const AppError = require("../utils/AppError");
const { readAuthCookie } = require("../utils/authCookie");
const authService = require("../modules/auth/auth.service");

/**
 * Only lets logged-in users through.
 * Puts the user on req.user: { id, email, role }
 */
function requireAuth(req, res, next) {
  const token = readAuthCookie(req);

  if (!token) {
    return next(new AppError("Not logged in.", 401));
  }

  try {
    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Only lets users with one of these roles through.
 * Use it after requireAuth: requireRole("admin")
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to do this.", 403));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };