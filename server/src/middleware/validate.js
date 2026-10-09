const AppError = require("../utils/AppError");

/**
 * Runs a validator function on req.body.
 * A validator returns { errors: [...], value: {...cleaned data} }.
 */
function validate(validator) {
  return (req, res, next) => {
    const { errors, value } = validator(req.body || {});

    if (errors.length > 0) {
      return next(new AppError(errors.join(" "), 400));
    }

    req.body = value; // the controller receives clean data
    next();
  };
}

module.exports = validate;