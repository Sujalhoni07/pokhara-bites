const AppError = require("../utils/AppError");

/* No route matched the URL */
function notFound(req, res, next) {
  next(new AppError("Route not found.", 404));
}

/**
 * Every error ends up here.
 * Known errors (4xx) show their message.
 * Unexpected errors (5xx) are logged, and the user gets a safe message.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  const message =
    statusCode >= 500 ? "Something went wrong. Please try again." : err.message;

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };