const authService = require("./auth.service");
const { setAuthCookie, clearAuthCookie } = require("../../utils/authCookie");

// POST /api/auth/register  (customers sign up)
async function register(req, res) {
  const { token, user } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

// POST /api/auth/login  (admin or customer)
async function login(req, res) {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);
  setAuthCookie(res, token);
  res.json({ user });
}

// POST /api/auth/logout
function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await authService.getProfile(req.user);
  res.json({ user });
}

module.exports = { register, login, logout, me };