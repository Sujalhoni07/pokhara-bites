/**
 * Format checks for authentication.
 * Each function returns { errors, value } with cleaned data.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(98|97)\d{8}$/;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRegister(body) {
  const errors = [];

  const name = cleanText(body.name);
  const email = cleanText(body.email).toLowerCase();
  const phone = cleanText(body.phone);
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 3 || name.length > 60) {
    errors.push("Name must be 3 to 60 characters.");
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 100) {
    errors.push("Please enter a valid email address.");
  }
  if (!PHONE_PATTERN.test(phone)) {
    errors.push("Phone must be 10 digits starting with 98 or 97.");
  }
  // bcrypt only uses the first 72 bytes of a password
  if (password.length < 8 || password.length > 72) {
    errors.push("Password must be 8 to 72 characters.");
  }

  return { errors, value: { name, email, phone, password } };
}

function validateLogin(body) {
  const errors = [];

  const email = cleanText(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) errors.push("Email is required.");
  if (!password) errors.push("Password is required.");

  return { errors, value: { email, password } };
}

module.exports = { validateRegister, validateLogin };