import { useState, useEffect } from "react";
import FoodCard from "../components/FoodCard";
import { useCart } from "../context/CartContext";
import "./Menu.css";

/* ===== HELPER: sort a copy of the list ===== */
function sortItems(items, sortBy) {
  const sorted = [...items]; // copy, because sort() changes the original array

  if (sortBy === "price-low") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // "popular": popular dishes first
    sorted.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
  }

  return sorted;
}

function Menu() {
  /* ----- cart ----- */
  const { addToCart } = useCart();

  /* ----- data from the "server" ----- */
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  /* ----- user choices ----- */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  /* ----- load the menu once (and again on "Try Again") ----- */
  useEffect(() => {
    let ignore = false;

    async function loadMenu() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/menu.json");
        if (!response.ok) {
          throw new Error("Sorry, we couldn't load the menu.");
        }
        const data = await response.json();
        if (!ignore) setMenuItems(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadMenu();

    return () => {
      ignore = true; // cleanup: ignore the result if the user left the page
    };
  }, [reloadKey]);

  /* ----- values calculated from state (no extra state needed) ----- */
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];

  const query = search.trim().toLowerCase();

  const filteredItems = sortItems(
    menuItems.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesVeg = !vegOnly || item.isVeg;
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesVeg && matchesSearch;
    }),
    sortBy
  );

  /* ----- event handlers ----- */
  function countFor(cat) {
    if (cat === "All") return menuItems.length;
    return menuItems.filter((item) => item.category === cat).length;
  }

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setVegOnly(false);
    setSortBy("popular");
  }

  function handleAddToCart(item) {
    addToCart(item);
  }

  /* ----- decide what to show ----- */
  function renderContent() {
    if (loading) {
      return (
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading the menu…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="menu-status">
          <p className="status-title">😕 {error}</p>
          <button
            className="btn btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="menu-status">
          <p className="status-title">
            No dishes found{query && ` for "${search.trim()}"`}
          </p>
          <p>Try another word or clear the filters.</p>
          <button className="btn btn-outline" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <>
        <p className="results-info">
          Showing {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "dish" : "dishes"}
        </p>
        <div className="food-grid">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </>
    );
  }

  /* ----- page layout ----- */
  return (
    <section className="page">
      <div className="container">
        <header className="menu-header">
          <p className="eyebrow">Fresh every day</p>
          <h1>Our Menu</h1>
          <p className="menu-subtitle">
            Nepali favorites, comfort food and good coffee, made fresh in our
            Lakeside kitchen.
          </p>
        </header>

        {/* TOOLBAR: search + veg toggle + sort */}
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
              placeholder="Search momo, coffee, thukpa..."
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
              <option value="popular">Most popular</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
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

        {renderContent()}
      </div>
    </section>
  );
}

export default Menu;