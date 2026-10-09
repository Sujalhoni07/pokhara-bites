/* ===== PRICES =====
   The API has no prices, so the café sets a price for each meal type */
export const PRICES = {
  Breakfast: 280,
  Appetizer: 320,
  Lunch: 450,
  Dinner: 550,
  Snack: 220,
  "Side Dish": 250,
  Dessert: 300,
  Beverage: 180,
};

const DEFAULT_PRICE = 400;

/* ===== VEG / NON-VEG ===== */
const NON_VEG_WORDS = [
  "chicken", "beef", "shrimp", "prawn", "fish", "salmon", "tuna",
  "anchovy", "anchovies", "pork", "bacon", "lamb", "mutton",
  "turkey", "meat", "egg",
];

// All the words in a recipe's name, tags and ingredients
export function getWords(recipe) {
  const text = [recipe.name, ...(recipe.tags || []), ...(recipe.ingredients || [])]
    .join(" ")
    .toLowerCase();
  return text.split(/[^a-z]+/);
}

export function isBeef(recipe) {
  return getWords(recipe).includes("beef");
}

export function checkIsVeg(words) {
  return !NON_VEG_WORDS.some(
    (word) => words.includes(word) || words.includes(word + "s")
  );
}

/* ===== API RECIPE → OUR MENU ITEM ===== */
export function toMenuItem(recipe) {
  const category = recipe.mealType?.[0] ?? "Other";
  const ingredients = recipe.ingredients || [];

  return {
    id: recipe.id,
    name: recipe.name,
    description: ingredients.length
      ? "Made with " + ingredients.slice(0, 3).join(", ").toLowerCase() + "."
      : `A ${recipe.cuisine} favourite.`,
    category,
    cuisine: recipe.cuisine,
    price: PRICES[category] || DEFAULT_PRICE,
    image: recipe.image,
    rating: recipe.rating,
    reviewCount: recipe.reviewCount,
    isPopular: recipe.rating >= 4.8,
    isVeg: checkIsVeg(getWords(recipe)),
    ingredients,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    caloriesPerServing: recipe.caloriesPerServing,
  };
}

/* ===== OUR OWN DISHES =====
   IDs start at 101 so they never clash with the API's IDs */
export const OUR_DISHES = [
  {
    id: 101, name: "Chicken Momo", category: "Nepali Specials", cuisine: "Nepali",
    description: "Juicy steamed chicken dumplings with spicy tomato achar.",
    price: 250, image: "/images/momo.jpg", rating: 4.9, reviewCount: 68,
    isPopular: true, isVeg: false,
    ingredients: ["Minced chicken", "Onion", "Garlic", "Ginger", "Momo wrappers", "Tomato achar"],
  },
  {
    id: 102, name: "Thakali Set", category: "Nepali Specials", cuisine: "Nepali",
    description: "Rice, dal, gundruk, pickle and chicken curry.",
    price: 550, image: "/images/thakali.jpg", rating: 4.8, reviewCount: 54,
    isPopular: true, isVeg: false,
    ingredients: ["Steamed rice", "Black lentil dal", "Chicken curry", "Gundruk", "Seasonal greens", "Pickle"],
  },
  {
    id: 103, name: "Chicken Chowmein", category: "Nepali Specials", cuisine: "Nepali",
    description: "Stir-fried noodles with fresh vegetables and chicken.",
    price: 220, image: "/images/chowmein.jpg", rating: 4.5, reviewCount: 41,
    isPopular: false, isVeg: false,
    ingredients: ["Noodles", "Chicken strips", "Cabbage", "Carrot", "Spring onion", "Soy sauce"],
  },
  {
    id: 104, name: "Veg Thukpa", category: "Nepali Specials", cuisine: "Nepali",
    description: "Warm Himalayan noodle soup, perfect for a cold evening.",
    price: 240, image: "/images/thukpa.jpg", rating: 4.6, reviewCount: 37,
    isPopular: false, isVeg: true,
    ingredients: ["Noodles", "Vegetable broth", "Carrot", "Cabbage", "Tomato", "Coriander"],
  },
  {
    id: 105, name: "Café Latte", category: "Beverage", cuisine: "Café",
    description: "Smooth espresso with silky steamed milk.",
    price: 220, image: "/images/coffee.jpg", rating: 4.8, reviewCount: 92,
    isPopular: true, isVeg: true,
    ingredients: ["Freshly roasted Nepali coffee beans", "Milk"],
  },
  {
    id: 106, name: "Masala Milk Tea", category: "Beverage", cuisine: "Nepali",
    description: "Nepali chiya with ginger, cardamom and fresh milk.",
    price: 80, image: "/images/milk-tea.jpg", rating: 4.7, reviewCount: 120,
    isPopular: false, isVeg: true,
    ingredients: ["Black tea", "Milk", "Ginger", "Cardamom", "Sugar"],
  },
  {
    id: 107, name: "Chocolate Cake", category: "Dessert", cuisine: "Café",
    description: "Rich, moist chocolate cake baked fresh every morning.",
    price: 280, image: "/images/cake.jpg", rating: 4.7, reviewCount: 58,
    isPopular: false, isVeg: false,
    ingredients: ["Flour", "Cocoa powder", "Eggs", "Butter", "Sugar", "Dark chocolate"],
  },
];

// The dishes shown on the Home page
export const FEATURED_IDS = [101, 102, 105, 107];