import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

function FoodCard({ item, onAddToCart }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="food-card">
      <Link to={`/menu/${item.id}`} className="food-image" tabIndex={-1} aria-hidden="true">
        <img src={item.image} alt="" loading="lazy" />

        {item.isPopular && (
          <span className="badge-popular">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            Popular
          </span>
        )}

        {/* green = veg, red = non-veg */}
        <span className={`veg-mark ${item.isVeg ? "veg" : "non-veg"}`}></span>
      </Link>

      <div className="food-body">
        <p className="food-category">
          {item.category}
          <span className="sr-only">, {item.isVeg ? "vegetarian" : "non-vegetarian"}</span>
        </p>

        <h3>
          <Link to={`/menu/${item.id}`}>{item.name}</Link>
        </h3>

        <p className="food-desc">{item.description}</p>

        <div className="food-footer">
          <span className="food-price">{formatPrice(item.price)}</span>
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