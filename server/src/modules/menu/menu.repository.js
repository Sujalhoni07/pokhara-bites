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

/* ----- admin ----- */

// Every dish, hidden ones too
async function findAll() {
  const { rows } = await db.query(`${SELECT_ITEMS} ORDER BY c.sort_order, i.name`);
  return rows.map(toMenuItem);
}

async function findById(id) {
  const { rows } = await db.query(`${SELECT_ITEMS} WHERE i.id = $1`, [id]);
  return toMenuItem(rows[0]);
}

// Returns the new dish (with its category name)
async function create(dish) {
  const { rows } = await db.query(
    `INSERT INTO menu_items
       (category_id, name, description, price, is_veg, is_popular, is_available, image_url, ingredients)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      dish.categoryId, dish.name, dish.description, dish.price,
      dish.isVeg, dish.isPopular, dish.isAvailable, dish.imageUrl, dish.ingredients,
    ]
  );
  return findById(rows[0].id);
}

// Returns the updated dish, or null if it doesn't exist
async function update(id, dish) {
  const { rows } = await db.query(
    `UPDATE menu_items
     SET category_id = $2, name = $3, description = $4, price = $5, is_veg = $6,
         is_popular = $7, is_available = $8, image_url = $9, ingredients = $10,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      id, dish.categoryId, dish.name, dish.description, dish.price,
      dish.isVeg, dish.isPopular, dish.isAvailable, dish.imageUrl, dish.ingredients,
    ]
  );
  return rows[0] ? findById(id) : null;
}

// Hide or show a dish, returns the dish or null
async function setAvailability(id, isAvailable) {
  const { rows } = await db.query(
    `UPDATE menu_items SET is_available = $2, updated_at = now()
     WHERE id = $1 RETURNING id`,
    [id, isAvailable]
  );
  return rows[0] ? findById(id) : null;
}

module.exports = {
  findAvailable,
  findAvailableById,
  findCategories,
  findAll,
  findById,
  create,
  update,
  setAvailability,
};