import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { getDish } from "../api/menu.api";

function DishDetails() {
  const { id } = useParams(); // "/menu/4" → "4"
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
        const data = await getDish(id);
        if (!ignore) setDish(data.item);
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
          <h1>Dish not found</h1>
          <p>{error}</p>
          <Link to="/menu" className="btn btn-primary">
            Back to menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page container dish-page">
      <Link to="/menu" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to menu
      </Link>

      <div className="dish-top">
        <img src={dish.image} alt={dish.name} className="dish-photo" />

        <div className="dish-info">
          <div className="dish-tags">
            <span className="dish-tag category">{dish.category}</span>
            <span className={`dish-tag ${dish.isVeg ? "veg" : "non-veg"}`}>
              {dish.isVeg ? "Vegetarian" : "Non-vegetarian"}
            </span>
            {dish.isPopular && (
              <span className="dish-tag popular">
                <Star size={12} fill="currentColor" aria-hidden="true" />
                Popular
              </span>
            )}
          </div>

          <h1>{dish.name}</h1>
          <p className="dish-description">{dish.description}</p>

          <div className="dish-buy">
            <div>
              <p className="dish-price-label">Price</p>
              <p className="dish-price">{formatPrice(dish.price)}</p>
            </div>
            <button
              className={`btn btn-primary dish-add ${added ? "added" : ""}`}
              onClick={handleAdd}
            >
              {added ? "Added to cart ✓" : "+ Add to cart"}
            </button>
          </div>
        </div>
      </div>

      {dish.ingredients.length > 0 && (
        <div className="dish-bottom">
          <h2>What's inside</h2>
          <p className="dish-note">
            We list our ingredients so you can check for allergies and dietary
            needs. Ask our staff if you have any questions.
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