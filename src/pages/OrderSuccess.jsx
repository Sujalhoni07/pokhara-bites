import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  /* ----- opened directly, without placing an order ----- */
  if (!order) {
    return (
      <section className="page">
        <div className="container success-empty">
          <h1>No Recent Order</h1>
          <p>It looks like you opened this page directly. Place an order from our menu first.</p>
          <Link to="/menu" className="btn btn-primary">
            Go to Menu
          </Link>
        </div>
      </section>
    );
  }

  const isDelivery = order.orderType === "delivery";
  const firstName = order.customer.name.split(" ")[0];
  const placedTime = new Date(order.placedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="page">
      <div className="container success-wrap">
        {/* animated check mark */}
        <div className="success-check" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
            <path className="check-mark" fill="none" d="M14 27l8 8 16-16" />
          </svg>
        </div>

        <h1>Thank You for Your Order!</h1>
        <p className="success-lead">
          Dhanyabad, {firstName}! We've received your order and the kitchen
          is getting started.
        </p>

        {/* key info */}
        <div className="success-info">
          <div>
            <span>Order number</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div>
            <span>{isDelivery ? "Estimated delivery" : "Ready for pickup"}</span>
            <strong>{isDelivery ? "30–40 min" : "About 20 min"}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{isDelivery ? "Cash on delivery" : "Pay at counter"}</strong>
          </div>
        </div>

        {/* receipt */}
        <div className="receipt">
          <h2>Order Summary</h2>
          <p className="receipt-meta">
            Placed at {placedTime} ·{" "}
            {isDelivery ? `Delivery to ${order.address}` : "Pickup at Lakeside, Pokhara"}
          </p>

          <ul className="receipt-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="receipt-rows">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div>
              <dt>VAT (13%)</dt>
              <dd>{formatPrice(order.vat)}</dd>
            </div>
            <div>
              <dt>{isDelivery ? "Delivery" : "Pickup"}</dt>
              <dd>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</dd>
            </div>
            <div className="receipt-total">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>

          {order.note && (
            <p className="receipt-note">
              <strong>Your note:</strong> {order.note}
            </p>
          )}

          <p className="receipt-contact">
            We'll call you at <strong>+977 {order.customer.phone}</strong> if needed.
          </p>
        </div>

        <div className="success-actions">
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
          <Link to="/menu" className="btn btn-primary">
            Order Something Else
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;