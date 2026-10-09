const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/env");
const AppError = require("../../utils/AppError");
const adminRepository = require("../admin/admin.repository");
const userRepository = require("../users/user.repository");

const SALT_ROUNDS = 10;

/* Only the safe fields, never the password hash */
function toPublicUser(account) {
  return {
    id: account.id,
    name: account.name || "",
    email: account.email,
    phone: account.phone || "",
    role: account.role,
  };
}

function createToken(account) {
  return jwt.sign(
    { id: account.id, name: account.name, email: account.email, role: account.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/* ----- sign up (customers only) ----- */
async function register({ name, email, phone, password }) {
  if (email === config.admin.email) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ name, email, phone, passwordHash });

  if (!user) {
    throw new AppError("An account with this email already exists.", 409);
  }

  return { token: createToken(user), user: toPublicUser(user) };
}

/* ----- log in (admin or customer) ----- */
async function login(email, password) {
  const account =
    (await adminRepository.findByEmail(email)) ||
    (await userRepository.findByEmail(email));

  const passwordOk = account
    ? await bcrypt.compare(password, account.passwordHash)
    : false;

  // same message for a wrong email and a wrong password
  if (!passwordOk) {
    throw new AppError("Wrong email or password.", 401);
  }

  return { token: createToken(account), user: toPublicUser(account) };
}

/* ----- who am I ----- */
async function getProfile(tokenUser) {
  if (tokenUser.role === "customer") {
    // read fresh details (like the phone) from storage
    const user = await userRepository.findById(tokenUser.id);
    if (!user) {
      throw new AppError("Account not found. Please log in again.", 401);
    }
    return toPublicUser(user);
  }

  return toPublicUser(tokenUser);
}

/* ----- check a token ----- */
function verifyToken(token) {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    throw new AppError("Session expired. Please log in again.", 401);
  }
}

module.exports = { register, login, getProfile, verifyToken };