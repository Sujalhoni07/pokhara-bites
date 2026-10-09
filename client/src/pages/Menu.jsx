import { useState, useEffect } from "react";
import { WifiOff, SearchX } from "lucide-react";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/CartContext";
import { fetchMenu } from "../api/menu.api";

function Menu() {
  const { addToCart } = useCart();

  // data
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // user choices
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  async function loadMenu() {
    setLoading(true);
    setError("");
    try {
      setMenuItems(await fetchMenu());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  /* ----- calculated values ----- */
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];
  const query = search.trim().toLowerCase();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.cuisine.toLowerCase().includes(query);
    return matchesCategory && matchesVeg && matchesSearch;
  });

  // filter() made a new array, so sorting it is safe
  if (sortBy === "price-low") {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredItems.sort((a, b) => b.price - a.price);
  } else {
    filteredItems.sort((a, b) => b.rating - a.rating);
  }

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
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="menu-search"
              type="search"
              placeholder="Search momo, biryani, ramen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")} aria-label="Clear search">
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
        <div className="category-tabs" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
              <span className="tab-count">{countFor(cat)}</span>
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="menu-status">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading the menu…</p>
          </div>
        )}

        {/* ERROR */}
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

        {/* NOTHING FOUND */}
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

        {/* DISHES */}
        {!loading && !error && filteredItems.length > 0 && (
          <>
            <p className="results-info">
              Showing {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
            </p>
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