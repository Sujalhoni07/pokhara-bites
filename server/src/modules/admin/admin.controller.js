/**
 * Admin dashboard endpoints.
 * TODO (backend team): add orders, reservations and menu management here.
 */

function getSummary(req, res) {
  res.json({
    message: `Welcome back, ${req.user.email}`,
    role: req.user.role,
  });
}

module.exports = { getSummary };