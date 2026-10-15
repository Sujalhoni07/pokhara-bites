import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarX, Clock, Users } from "lucide-react";
import { getMyReservations, cancelMyReservation } from "../api/reservations.api";
import { formatDate, formatTime } from "../utils/dateFormat";

const STATUS_LABELS = {
  pending: "Waiting for confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

function isUpcoming(reservation) {
  return new Date(`${reservation.date}T${reservation.time}`) > new Date();
}

/* One booking card */
function ReservationCard({ reservation, onCancel, cancelling }) {
  const upcoming = isUpcoming(reservation);
  const canCancel = upcoming && ["pending", "confirmed"].includes(reservation.status);

  return (
    <li className={`res-card ${upcoming ? "" : "is-past"}`}>
      <div className="res-main">
        <p className="res-code">{reservation.code}</p>
        <p className="res-when">
          {formatDate(reservation.date)} · {formatTime(reservation.time)}
        </p>
        <p className="res-meta">
          <span>
            <Users size={14} aria-hidden="true" />
            {reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}
          </span>
          <span>
            <Clock size={14} aria-hidden="true" />
            Held for 15 minutes
          </span>
        </p>
        {reservation.note && <p className="res-note">"{reservation.note}"</p>}
      </div>

      <div className="res-side">
        <span className={`res-status ${reservation.status}`}>
          {STATUS_LABELS[reservation.status]}
        </span>
        {canCancel && (
          <button
            className="res-cancel"
            onClick={() => onCancel(reservation)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel booking"}
          </button>
        )}
      </div>
    </li>
  );
}

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState("");

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyReservations();
      setReservations(data.reservations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function handleCancel(reservation) {
    const ok = window.confirm(
      `Cancel your table on ${formatDate(reservation.date)} at ${formatTime(reservation.time)}?`
    );
    if (!ok) return;

    setCancellingId(reservation.id);
    setActionError("");
    try {
      const data = await cancelMyReservation(reservation.id);
      // replace just that booking in the list
      setReservations((prev) =>
        prev.map((item) => (item.id === reservation.id ? data.reservation : item))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  const upcoming = reservations.filter(isUpcoming);
  const past = reservations.filter((item) => !isUpcoming(item)).reverse(); // newest first

  return (
    <section className="page container">
      <div className="my-res-header">
        <h1>My Reservations</h1>
        <Link to="/reserve" className="btn btn-primary">
          Book a Table
        </Link>
      </div>

      {loading && (
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading your bookings…</p>
        </div>
      )}

      {!loading && error && (
        <div className="menu-status">
          <p className="status-title">{error}</p>
          <button className="btn btn-primary" onClick={loadReservations}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="menu-status">
          <span className="status-icon" aria-hidden="true">
            <CalendarX size={30} />
          </span>
          <p className="status-title">You have no bookings yet</p>
          <Link to="/reserve" className="btn btn-outline">
            Reserve a table
          </Link>
        </div>
      )}

      {actionError && (
        <p className="field-error form-error" role="alert">
          {actionError}
        </p>
      )}

      {!loading && !error && upcoming.length > 0 && (
        <div className="my-res-section">
          <h2>Upcoming</h2>
          <ul className="res-list">
            {upcoming.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                cancelling={cancellingId === reservation.id}
              />
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && past.length > 0 && (
        <div className="my-res-section">
          <h2>Past</h2>
          <ul className="res-list">
            {past.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default MyReservations;