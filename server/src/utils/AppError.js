/**
 * An error that carries an HTTP status code.
 * Throw it anywhere: throw new AppError("Not found.", 404)
 * The error handler turns it into a JSON response.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;