const AppError = require("../../utils/AppError");
const { PG_ERRORS } = require("../../database/errors");
const menuRepository = require("./menu.repository");

// "/api/menu/abc" or "/api/menu/1.5" → null
function toId(idParam) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Turn database errors into clear messages for the admin
function explainDbError(err) {
  if (err.code === PG_ERRORS.UNIQUE_VIOLATION) {
    return new AppError("A dish with this name already exists.", 409);
  }
  if (err.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
    return new AppError("That category does not exist.", 400);
  }
  return err;
}

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
  const id = toId(idParam);
  if (!id) {
    throw new AppError("Dish not found.", 404);
  }

  const item = await menuRepository.findAvailableById(id);
  if (!item) {
    throw new AppError("Dish not found.", 404);
  }
  return item;
}

/* ----- admin ----- */

// Every dish (hidden ones too) + every category, for the admin screen
async function getMenuForAdmin() {
  const [categories, items] = await Promise.all([
    menuRepository.findCategories(),
    menuRepository.findAll(),
  ]);
  return { categories, items };
}

async function createDish(data) {
  try {
    return await menuRepository.create(data);
  } catch (err) {
    throw explainDbError(err);
  }
}

async function updateDish(idParam, data) {
  const id = toId(idParam);
  let item = null;

  if (id) {
    try {
      item = await menuRepository.update(id, data);
    } catch (err) {
      throw explainDbError(err);
    }
  }
  if (!item) {
    throw new AppError("Dish not found.", 404);
  }
  return item;
}

async function setAvailability(idParam, isAvailable) {
  const id = toId(idParam);
  const item = id ? await menuRepository.setAvailability(id, isAvailable) : null;
  if (!item) {
    throw new AppError("Dish not found.", 404);
  }
  return item;
}

module.exports = { getMenu, getDish, getMenuForAdmin, createDish, updateDish, setAvailability };