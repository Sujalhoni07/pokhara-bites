import { Link } from "react-router-dom";
import {
  useCart,
  FREE_DELIVERY_MIN,
  MAX_QUANTITY,
} from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import "./Cart.css";

function Cart() {
  // Hooks must be called at the top, before any "return"
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    vat,
  } = useCart();

  /* ===== EMPTY CART ===== */
  if (cartItems.length === 0) {
    return (
      <section className="page">
        <div className="container cart-empty">
          <span className="empty-icon" aria-hidden="true">🛒</span>
          <h1>Your Cart</h1>
          <p>Your cart is empty. Let's fix that!</p>
          <Link to="/menu" className="btn btn-primary">
            Browse the Menu
          </Link>
        </div>
      </section>
    );
  }

  /* ===== CALCULATIONS ===== */
  const total = subtotal + vat;
  const remaining = FREE_DELIVERY_MIN - subtotal;
  const progress = Math.min((subtotal / FREE_DELIVERY_MIN) * 100, 100);

  function handleClear() {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart();
    }
  }

  /* ===== CART WITH ITEMS ===== */
  return (
    <section className="page">
      <div className="container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <p>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="cart-layout">
          {/* LEFT: items */}
          <div>
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />

                  <div className="cart-item-info">
                    <h2 className="cart-item-name">{item.name}</h2>
                    <p className="cart-item-price">{formatPrice(item.price)} each</p>
                  </div>

                  <div className="qty-control">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      disabled={item.quantity === 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.quantity >= MAX_QUANTITY}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-item-total">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-actions">
              <Link to="/menu" className="continue-link">
                ← Continue shopping
              </Link>
              <button className="clear-cart-btn" onClick={handleClear}>
                Clear cart
              </button>
            </div>
          </div>

          {/* RIGHT: summary */}
          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="delivery-progress">
              {remaining > 0 ? (
                <p>
                  Add <strong>{formatPrice(remaining)}</strong> more for free delivery 🛵
                </p>
              ) : (
                <p>🎉 You've unlocked <strong>free delivery!</strong></p>
              )}
              <div className="progress">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <dl className="summary-rows">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>VAT (13%)</dt>
                <dd>{formatPrice(vat)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>At checkout</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Proceed to Checkout
            </Link>
            <p className="summary-note">💵 Cash on delivery available</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;