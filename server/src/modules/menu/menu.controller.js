const menuService = require("./menu.service");

/* ----- public ----- */

// GET /api/menu
async function list(req, res) {
  const menu = await menuService.getMenu();
  res.json(menu); // { categories, items }
}

// GET /api/menu/:id
async function getOne(req, res) {
  const item = await menuService.getDish(req.params.id);
  res.json({ item });
}

/* ----- admin ----- */

// GET /api/menu/admin
async function listForAdmin(req, res) {
  const menu = await menuService.getMenuForAdmin();
  res.json(menu);
}

// POST /api/menu
async function create(req, res) {
  const item = await menuService.createDish(req.body);
  res.status(201).json({ item });
}

// PUT /api/menu/:id
async function update(req, res) {
  const item = await menuService.updateDish(req.params.id, req.body);
  res.json({ item });
}

// PATCH /api/menu/:id/availability
async function setAvailability(req, res) {
  const item = await menuService.setAvailability(req.params.id, req.body.isAvailable);
  res.json({ item });
}

module.exports = { list, getOne, listForAdmin, create, update, setAvailability };