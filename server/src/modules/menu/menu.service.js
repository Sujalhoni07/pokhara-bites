const AppError = require("../../utils/AppError");
const menuRepository = require("./menu.repository");

// The whole public menu: categories (for the filter tabs) + dishes
async function getMenu() {
  const [categories, items] = await Promise.all([
    menuRepository.findCategories(),
    menuRepository.findAvailable(),
  ]);

  // only show categories that have at least one dish today
  const used = new Set(items.map((item) => item.categoryId));
  return {
    categories: categories.filter((category) => used.has(category.id)),
    items,
  };
}

async function getDish(idParam) {
  const id = Number(idParam);

  // "/api/menu/abc" or "/api/menu/1.5" → simply "not found"
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError("Dish not found.", 404);
  }

  const item = await menuRepository.findAvailableById(id);
  if (!item) {
    throw new AppError("Dish not found.", 404);
  }
  return item;
}

module.exports = { getMenu, getDish };