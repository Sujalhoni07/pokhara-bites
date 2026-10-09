import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, Flame, Users, ChefHat, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { fetchDish } from "../api/menu.api";

function DishDetails() {
  const { id } = useParams(); // "/menu/11" → "11"
  const { addToCart } = useCart();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let ignore = false; // ignore old results if the user opens another dish

    async function loadDish() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchDish(id);
        if (!ignore) setDish(result);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDish();
    return () => {
      ignore = true;
    };
  }, [id]);

  function handleAdd() {
    addToCart(dish);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  /* ----- LOADING ----- */
  if (loading) {
    return (
      <section className="page container">
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading the dish…</p>
        </div>
      </section>
    );
  }

  /* ----- NOT FOUND ----- */
  if (error) {
    return (
      <section className="page container">
        <div className="menu-status">
          <h1>Dish Not Found</h1>
          <p>{error}</p>
          <Link to="/menu" className="btn btn-primary">
            Back to Menu
          </Link>
        </div>
      </section>
    );
  }

  /* ----- QUICK FACTS (only the ones we have) ----- */
  const facts = [];
  if (dish.prepTimeMinutes) {
    facts.push({
      Icon: Clock,
      label: "Total time",
      value: `${dish.prepTimeMinutes + (dish.cookTimeMinutes || 0)} min`,
    });
  }
  if (dish.servings) {
    facts.push({ Icon: Users, label: "Serves", value: dish.servings });
  }
  if (dish.caloriesPerServing) {
    facts.push({ Icon: Flame, label: "Calories", value: `${dish.caloriesPerServing} kcal` });
  }
  if (dish.difficulty) {
    facts.push({ Icon: ChefHat, label: "Difficulty", value: dish.difficulty });
  }

  return (
    <section className="page container dish-page">
      <Link to="/menu" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to menu
      </Link>

      <div className="dish-top">
        <img src={dish.image} alt={dish.name} className="dish-photo" />

        <div>
          <p className="dish-meta">
            <span>{dish.cuisine}</span>
            <span className="dish-rating">
              <Star size={12} fill="currentColor" aria-hidden="true" />
              {dish.rating}
              {dish.reviewCount ? ` (${dish.reviewCount})` : ""}
            </span>
          </p>

          <div className="dish-title-row">
            <h1>{dish.name}</h1>
            <span
              className={`veg-mark ${dish.isVeg ? "veg" : "non-veg"}`}
              title={dish.isVeg ? "Vegetarian" : "Non-vegetarian"}
            >
              <span className="sr-only">{dish.isVeg ? "Vegetarian" : "Non-vegetarian"}</span>
            </span>
          </div>

          <p className="dish-description">{dish.description}</p>

          {facts.length > 0 && (
            <div className="fact-grid">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="fact-card">
                  <Icon size={18} aria-hidden="true" />
                  <p className="fact-label">{label}</p>
                  <p className="fact-value">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="dish-buy">
            <span className="dish-price">{formatPrice(dish.price)}</span>
            <button
              className={`btn btn-primary dish-add ${added ? "added" : ""}`}
              onClick={handleAdd}
            >
              {added ? "Added to cart ✓" : "+ Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {dish.ingredients?.length > 0 && (
        <div className="dish-bottom">
          <h2>What's inside</h2>
          <p className="dish-note">
            We list our ingredients so you can check for allergies and dietary
            needs. Our recipes and cooking methods stay in our kitchen.
          </p>
          <ul className="ingredient-list">
            {dish.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default DishDetails;