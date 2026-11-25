const db = require("../../database/db");

/**
 * Data access for the menu.
 * The only file that writes SQL for menu_items and menu_categories.
 */

// every item comes with its category name (JOIN)
const SELECT_ITEMS = `
  SELECT i.id, i.name, i.description, i.price, i.is_veg, i.is_popular,
         i.is_available, i.image_url, i.ingredients,
         c.id AS category_id, c.name AS category
  FROM menu_items i
  JOIN menu_categories c ON c.id = i.category_id`;

// Database row → object for our code
function toMenuItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    categoryId: row.category_id,
    isVeg: row.is_veg,
    isPopular: row.is_popular,
    isAvailable: row.is_available,
    image: row.image_url,
    ingredients: row.ingredients,
  };
}

// The menu customers see: available dishes, in category order
async function findAvailable() {
  const { rows } = await db.query(
    `${SELECT_ITEMS}
     WHERE i.is_available = true
     ORDER BY c.sort_order, i.name`
  );
  return rows.map(toMenuItem);
}

async function findAvailableById(id) {
  const { rows } = await db.query(
    `${SELECT_ITEMS}
     WHERE i.id = $1 AND i.is_available = true`,
    [id]
  );
  return toMenuItem(rows[0]);
}

async function findCategories() {
  const { rows } = await db.query(
    "SELECT id, name FROM menu_categories ORDER BY sort_order, name"
  );
  return rows;
}

module.exports = { findAvailable, findAvailableById, findCategories };