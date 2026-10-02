import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, FREE_DELIVERY_MIN, DELIVERY_FEE } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { Bike, Store, Banknote } from "lucide-react";

/* ===== VALIDATION RULES ===== */
const PHONE_PATTERN = /^(98|97)\d{8}$/; // 10 digits, starting with 98 or 97

function validate(form) {
  const errors = {};

  if (form.fullName.trim().length < 3) {
    errors.fullName = "Please enter your full name (at least 3 letters).";
  }

  if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number starting with 98 or 97.";
  }

  if (form.orderType === "delivery" && form.address.trim().length < 5) {
    errors.address = "Please enter your delivery address.";
  }

  return errors;
}

function Checkout() {
  /* ----- hooks (always at the top) ----- */
  const { cartItems, subtotal, vat, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    orderType: "delivery",
    address: "",
    note: "",
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);

  /* ----- empty cart: nothing to check out ----- */
  if (cartItems.length === 0 && !isPlacing) {
    return (
      <section className="page">
        <div className="container checkout-empty">
          <h1>Checkout</h1>
          <p>Your cart is empty, so there's nothing to check out yet.</p>
          <Link to="/menu" className="btn btn-primary">
            Browse the Menu
          </Link>
        </div>
      </section>
    );
  }

  /* ----- calculated values ----- */
  const errors = validate(form);
  const isDelivery = form.orderType === "delivery";
  const deliveryFee = isDelivery && subtotal < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
  const total = subtotal + vat + deliveryFee;

    const orderOptions = [
    {
      value: "delivery",
      icon: <Bike size={26} strokeWidth={1.75} />,
      title: "Delivery",
      text: subtotal >= FREE_DELIVERY_MIN
        ? "Free · 30–40 min"
        : `${formatPrice(DELIVERY_FEE)} · 30–40 min`,
    },
    {
      value: "pickup",
      icon: <Store size={26} strokeWidth={1.75} />,
      title: "Pickup",
      text: "Free · ready in 20 min",
    },
  ];

  /* ----- helpers ----- */
  // Show an error only after the user left the field, or tried to submit
  function showError(field) {
    return (touched[field] || submitted) && errors[field];
  }

  function fieldClass(field) {
    if (showError(field)) return "invalid";
    if (touched[field] && !errors[field]) return "valid";
    return "";
  }

  /* ----- event handlers ----- */
  function handleChange(e) {
    const { name, value } = e.target;
    // Phone: keep only digits, maximum 10
    const cleanValue = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop the page from reloading
    setSubmitted(true);

    // If something is wrong, move the cursor to the first wrong field
    const refs = { fullName: fullNameRef, phone: phoneRef, address: addressRef };
    const firstError = ["fullName", "phone", "address"].find((field) => errors[field]);
    if (firstError) {
      refs[firstError].current?.focus();
      return;
    }

    setIsPlacing(true);

    const order = {
      orderNumber: "PB-" + Date.now().toString().slice(-6),
      customer: { name: form.fullName.trim(), phone: form.phone },
      orderType: form.orderType,
      address: isDelivery ? form.address.trim() : "",
      note: form.note.trim(),
      items: cartItems,
      subtotal,
      vat,
      deliveryFee,
      total,
      placedAt: new Date().toISOString(),
    };

    // Simulate sending the order to a server.
    // In a real app, this is where we would call the backend API.
    setTimeout(() => {
      navigate("/order-success", { state: { order } });
      clearCart();
    }, 1200);
  }

  /* ----- page ----- */
  return (
    <section className="page">
      <div className="container">
        <header className="checkout-header">
          <h1>Checkout</h1>
          <ol className="checkout-steps">
            <li className="done">
              <span className="step-num">✓</span> Cart
            </li>
            <li className="current" aria-current="step">
              <span className="step-num">2</span> Details
            </li>
            <li>
              <span className="step-num">3</span> Done
            </li>
          </ol>
        </header>

        <div className="checkout-layout">
          {/* ===== LEFT: FORM ===== */}
          <form className="checkout-card" onSubmit={handleSubmit} noValidate>
            <h2>Your Details</h2>

            <div className="form-row">
              {/* Full name */}
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  ref={fullNameRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Sujal Tiwari"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass("fullName")}
                  aria-invalid={Boolean(showError("fullName"))}
                  aria-describedby={showError("fullName") ? "fullName-error" : undefined}
                />
                {showError("fullName") && (
                  <p id="fullName-error" className="field-error" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="field">
                <label htmlFor="phone">Mobile number</label>
                <div className="phone-input">
                  <span className="phone-prefix">+977</span>
                  <input
                    ref={phoneRef}
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fieldClass("phone")}
                    aria-invalid={Boolean(showError("phone"))}
                    aria-describedby={showError("phone") ? "phone-error" : undefined}
                  />
                </div>
                {showError("phone") && (
                  <p id="phone-error" className="field-error" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery or pickup */}
            <fieldset className="order-type">
              <legend>How would you like your order?</legend>
              <div className="option-grid">
                {orderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`option-card ${form.orderType === option.value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value={option.value}
                      checked={form.orderType === option.value}
                      onChange={handleChange}
                    />
                    <span className="option-icon" aria-hidden="true">{option.icon}</span>
                    <span className="option-title">{option.title}</span>
                    <span className="option-text">{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Address: only for delivery */}
            {isDelivery && (
              <div className="field reveal">
                <label htmlFor="address">Delivery address</label>
                <input
                  ref={addressRef}
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="e.g. Street 13, Lakeside, Pokhara"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass("address")}
                  aria-invalid={Boolean(showError("address"))}
                  aria-describedby={showError("address") ? "address-error" : undefined}
                />
                {showError("address") && (
                  <p id="address-error" className="field-error" role="alert">
                    {errors.address}
                  </p>
                )}
              </div>
            )}

            {/* Note (optional) */}
            <div className="field">
              <label htmlFor="note">
                Note for the kitchen <span className="optional">(optional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows="3"
                maxLength="200"
                placeholder="e.g. Less spicy, extra achar please"
                value={form.note}
                onChange={handleChange}
              ></textarea>
              <p className="field-hint">{form.note.length}/200</p>
            </div>

            {/* Payment info */}
            <div className="payment-note">
               <Banknote size={20} aria-hidden="true" />
              <p>
                <strong>{isDelivery ? "Cash on delivery" : "Pay at the counter"}</strong>
                <br />
                Online payment is coming soon.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary place-order-btn"
              disabled={isPlacing}
            >
              {isPlacing ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  Placing order…
                </>
              ) : (
                `Place Order · ${formatPrice(total)}`
              )}
            </button>
            <p className="form-footnote">
              By placing this order, you agree to be contacted about your order.
            </p>
          </form>

          {/* ===== RIGHT: ORDER SUMMARY ===== */}
          <aside className="checkout-summary">
            <h2>Your Order</h2>

            <ul className="mini-list">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <img src={item.image} alt="" />
                  <span className="mini-name">
                    {item.name} <small>× {item.quantity}</small>
                  </span>
                  <span className="mini-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="checkout-rows">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>VAT (13%)</dt>
                <dd>{formatPrice(vat)}</dd>
              </div>
              <div>
                <dt>{isDelivery ? "Delivery" : "Pickup"}</dt>
                <dd className={deliveryFee === 0 ? "free" : ""}>
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </dd>
              </div>
              <div className="checkout-total">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Link to="/cart" className="edit-cart-link">
              ← Edit cart
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Checkout;