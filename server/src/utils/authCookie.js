const config = require("../config/env");

// One place for the cookie settings
const baseOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it
  sameSite: "lax", // basic CSRF protection
  secure: config.isProduction, // HTTPS only in production
  path: "/",
};

function setAuthCookie(res, token) {
  res.cookie(config.cookie.name, token, {
    ...baseOptions,
    maxAge: config.cookie.maxAgeMs,
  });
}

function clearAuthCookie(res) {
  // no maxAge here, so the cookie is really deleted
  res.clearCookie(config.cookie.name, baseOptions);
}

function readAuthCookie(req) {
  return req.cookies[config.cookie.name];
}

module.exports = { setAuthCookie, clearAuthCookie, readAuthCookie };