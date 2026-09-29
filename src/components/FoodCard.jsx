import { useState } from "react";
import "./FoodCard.css";

function FoodCard({ item, onAddToCart }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAddToCart(item);          // tell the parent (Menu page)
    setAdded(true);             // show "Added ✓"
    setTimeout(() => setAdded(false), 1200); // back to "+ Add" after 1.2s
  }

  return (
    <article className="food-card">
      <div className="food-image">
        <img src={item.image} alt={item.name} loading="lazy" />

        {item.isPopular && <span className="badge-popular">★ Popular</span>}

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
            <span className="spicy" role="img" aria-label="Spicy">🌶️</span>
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