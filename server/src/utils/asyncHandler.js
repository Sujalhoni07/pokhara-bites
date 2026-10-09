/**
 * Wraps an async controller so any error goes to the error handler.
 * Without it, an error in an async function could crash the request.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;