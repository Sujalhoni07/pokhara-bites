import { useState } from "react";
import { Flame, Star } from "lucide-react";
import "./FoodCard.css";

function FoodCard({ item, onAddToCart }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="food-card">
      <div className="food-image">
        <img src={item.image} alt={item.name} loading="lazy" />

        {item.isPopular && (
          <span className="badge-popular">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            Popular
          </span>
        )}

        <span
          className={`veg-mark ${item.isVeg ? "veg" : "non-veg"}`}
          title={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
        >
          <span className="sr-only">
            {item.isVeg ? "Vegetarian" : "Non-vegetarian"}
          </span>
        </span>
      </div>

      <div className="food-body">
        <div className="food-title-row">
          <h3>{item.name}</h3>
          {item.isSpicy && (
            <span className="spicy" title="Spicy">
              <Flame size={18} aria-hidden="true" />
              <span className="sr-only">Spicy</span>
            </span>
          )}
        </div>

        <p className="food-desc">{item.description}</p>

        <div className="food-footer">
          <span className="food-price">Rs. {item.price}</span>
          <button
            className={`add-btn ${added ? "added" : ""}`}
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
          >
            {added ? "Added ✓" : "+ Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default FoodCard;