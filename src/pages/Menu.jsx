import { useState, useEffect } from "react";
import { WifiOff, SearchX } from "lucide-react";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/CartContext";



// Real API with café dishes (limit=0 gives all dishes)
const API_URL = "https://dummyjson.com/recipes?limit=0";
// Our own dishes with our own photos, shown together with the API dishes
export const OUR_DISHES = [
  { id: 101, name: "Chicken Momo", description: "Juicy steamed chicken dumplings with spicy tomato achar.", category: "Nepali Specials", cuisine: "Nepali", price: 250, image: "/images/momo.jpg", rating: 4.9, isPopular: true, isVeg: false },
  { id: 102, name: "Thakali Set", description: "Rice, dal, gundruk, pickle and chicken curry.", category: "Nepali Specials", cuisine: "Nepali", price: 550, image: "/images/thakali.jpg", rating: 4.8, isPopular: true, isVeg: false },
  { id: 103, name: "Chicken Chowmein", description: "Stir-fried noodles with fresh vegetables and chicken.", category: "Nepali Specials", cuisine: "Nepali", price: 220, image: "/images/chowmein.jpg", rating: 4.5, isPopular: false, isVeg: false },
  { id: 104, name: "Veg Thukpa", description: "Warm Himalayan noodle soup, perfect for a cold evening.", category: "Nepali Specials", cuisine: "Nepali", price: 240, image: "/images/thukpa.jpg", rating: 4.6, isPopular: false, isVeg: true },
  { id: 105, name: "Café Latte", description: "Smooth espresso with silky steamed milk.", category: "Beverage", cuisine: "Café", price: 220, image: "/images/coffee.jpg", rating: 4.8, isPopular: true, isVeg: true },
  { id: 106, name: "Masala Milk Tea", description: "Nepali chiya with ginger, cardamom and fresh milk.", category: "Beverage", cuisine: "Nepali", price: 80, image: "/images/milk-tea.jpg", rating: 4.7, isPopular: false, isVeg: true },
  { id: 107, name: "Chocolate Cake", description: "Rich, moist chocolate cake baked fresh every morning.", category: "Dessert", cuisine: "Café", price: 280, image: "/images/cake.jpg", rating: 4.7, isPopular: false, isVeg: false },
];

// The API has no prices, so the café sets a price for each meal type
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

// If a dish has any of these words, it is NOT vegetarian
const NON_VEG_WORDS = [
  "chicken",
  "beef",
  "shrimp",
  "prawn",
  "fish",
  "salmon",
  "tuna",
  "anchovy",
  "anchovies",
  "pork",
  "bacon",
  "lamb",
  "mutton",
  "turkey",
  "meat",
  "egg",
];

// Get all the words from a recipe's name, tags and ingredients
export function getWords(recipe) {
  const text = [recipe.name, ...recipe.tags, ...recipe.ingredients]
    .join(" ")
    .toLowerCase();
  return text.split(/[^a-z]+/); // split on anything that is not a letter
}

// A dish is veg if none of its words is a non-veg word (or its plural, like "eggs")
export function checkIsVeg(words) {
  return !NON_VEG_WORDS.some(
    (word) => words.includes(word) || words.includes(word + "s")
  );
}

function Menu() {
  const { addToCart } = useCart();

  // data from the API
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // user choices
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  // Get the dishes from the API
  async function loadMenu() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Could not load the menu");
      }
      const data = await response.json();

      const dishes = data.recipes
        // 1. Remove every beef dish
        .filter((recipe) => !getWords(recipe).includes("beef"))
        // 2. Change each recipe into the format our app uses
        .map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          description:"Made with " + recipe.ingredients.slice(0, 3).join(", ").toLowerCase() + ".",
          category: recipe.mealType[0],
          cuisine: recipe.cuisine,
          price: PRICES[recipe.mealType[0]] || 400,
          image: recipe.image,
          rating: recipe.rating,
          isPopular: recipe.rating >= 4.8,
          isVeg: checkIsVeg(getWords(recipe)),
        }));

      setMenuItems([...OUR_DISHES, ...dishes]);
    } catch (err) {
      setError("Sorry, we couldn't load the menu. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  // Load the menu once, when the page opens
  useEffect(() => { 
    loadMenu();
  }, []);

  // Category tabs: "All" + every unique meal type
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];

  // Filter by category, veg and search
  const query = search.trim().toLowerCase();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.cuisine.toLowerCase().includes(query);
    return matchesCategory && matchesVeg && matchesSearch;
  });

  // Sort (filter() already made a new array, so sorting it is safe)
  if (sortBy === "price-low") {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredItems.sort((a, b) => b.price - a.price);
  } else {
    filteredItems.sort((a, b) => b.rating - a.rating);
  }

  // How many dishes are in each category
  function countFor(cat) {
    if (cat === "All") return menuItems.length;
    return menuItems.filter((item) => item.category === cat).length;
  }

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setVegOnly(false);
    setSortBy("rating");
  }

  return (
    <section className="page">
      <div className="container">
        {/* HEADER */}
        <header className="menu-header">
          <p className="eyebrow">Fresh every day</p>
          <h1>Our Menu</h1>
          <p className="menu-subtitle">
            Dishes from around the world, made fresh in our Lakeside kitchen.
          </p>
        </header>

        {/* SEARCH + VEG + SORT */}
        <div className="menu-toolbar">
          <div className="search-box">
            <label htmlFor="menu-search" className="sr-only">
              Search dishes
            </label>
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="menu-search"
              type="search"
              placeholder="Search pizza, biryani, ramen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <label className="veg-toggle">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              <span className="switch" aria-hidden="true"></span>
              Veg only
            </label>

            <label htmlFor="sort" className="sr-only">
              Sort dishes
            </label>
            <select
              id="sort"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Highest rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
              <span className="tab-count">{countFor(cat)}</span>
            </button>
          ))}
        </div>

        {/* 1. LOADING */}
        {loading && (
          <div className="menu-status">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading the menu…</p>
          </div>
        )}

        {/* 2. ERROR */}
        {!loading && error && (
          <div className="menu-status">
            <span className="status-icon" aria-hidden="true">
              <WifiOff size={30} />
            </span>
            <p className="status-title">{error}</p>
            <button className="btn btn-primary" onClick={loadMenu}>
              Try Again
            </button>
          </div>
        )}

        {/* 3. NOTHING FOUND */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="menu-status">
            <span className="status-icon" aria-hidden="true">
              <SearchX size={30} />
            </span>
            <p className="status-title">No dishes found</p>
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* 4. DISHES */}
        {!loading && !error && filteredItems.length > 0 && (
          <>
            <p className="results-info">Showing {filteredItems.length} dishes</p>
            <div className="food-grid">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Menu;