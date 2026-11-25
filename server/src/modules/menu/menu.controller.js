const menuService = require("./menu.service");

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

module.exports = { list, getOne };