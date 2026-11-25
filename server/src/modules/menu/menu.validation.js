/**
 * Format checks for dishes the admin adds or edits.
 * Business rules (does the category exist? is the name taken?) live in the service.
 */

const MAX_PRICE = 100000;
const MAX_INGREDIENTS = 20;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// accepts ["Rice", "Dal"] or "Rice, Dal"
function cleanIngredients(value) {
  const list = Array.isArray(value) ? value : cleanText(value).split(",");
  return list.map(cleanText).filter(Boolean);
}

function validateDish(body) {
  const errors = [];

  const name = cleanText(body.name);
  const description = cleanText(body.description);
  const price = Number(body.price);
  const categoryId = Number(body.categoryId);
  const imageUrl = cleanText(body.imageUrl);
  const ingredients = cleanIngredients(body.ingredients);
  const isVeg = body.isVeg === true;
  const isPopular = body.isPopular === true;
  const isAvailable = body.isAvailable !== false; // new dishes are visible by default

  if (name.length < 2 || name.length > 80) {
    errors.push("Name must be 2 to 80 characters.");
  }
  if (description.length < 10 || description.length > 300) {
    errors.push("Description must be 10 to 300 characters.");
  }
  if (!Number.isInteger(price) || price < 1 || price > MAX_PRICE) {
    errors.push(`Price must be a whole number of rupees between 1 and ${MAX_PRICE}.`);
  }
  if (!Number.isInteger(categoryId) || categoryId < 1) {
    errors.push("Please choose a category.");
  }
  if (imageUrl && !imageUrl.startsWith("/images/") && !imageUrl.startsWith("https://")) {
    errors.push('Image must be a path like "/images/momo.jpg" or an https:// link.');
  }
  if (ingredients.length > MAX_INGREDIENTS) {
    errors.push(`Add at most ${MAX_INGREDIENTS} ingredients.`);
  }
  if (ingredients.some((item) => item.length > 60)) {
    errors.push("Each ingredient must be 60 characters or fewer.");
  }

  return {
    errors,
    value: {
      name,
      description,
      price,
      categoryId,
      imageUrl: imageUrl || null,
      ingredients,
      isVeg,
      isPopular,
      isAvailable,
    },
  };
}

function validateAvailability(body) {
  const errors =
    typeof body.isAvailable === "boolean" ? [] : ["isAvailable must be true or false."];
  return { errors, value: { isAvailable: body.isAvailable } };
}

module.exports = { validateDish, validateAvailability };