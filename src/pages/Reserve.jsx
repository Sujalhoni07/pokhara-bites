import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Clock, Users, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PHONE_PATTERN = /^(98|97)\d{8}$/;
const MAX_GUESTS = 20;
const DAYS_AHEAD = 30;

// Opening hours: Saturday (day 6) is different
function getHours(dateString) {
  const day = new Date(dateString).getDay();
  const isSaturday = day === 6;
  return {
    open: isSaturday ? 8 : 7,
    close: isSaturday ? 22 : 21,
    label: isSaturday ? "8:00 AM – 10:00 PM" : "7:00 AM – 9:00 PM",
  };
}

// Build time slots every 30 minutes, stopping 1 hour before closing
function getTimeSlots(dateString) {
  const { open, close } = getHours(dateString);
  const slots = [];

  for (let hour = open; hour <= close - 1; hour++) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const suffix = hour < 12 ? "AM" : "PM";
      slots.push({
        value,
        label: `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`,
        hours: hour + minute / 60,
      });
    }
  }

  return slots;
}

// Today and the last bookable date, as "YYYY-MM-DD"
function toInputDate(date) {
  return date.toISOString().split("T")[0];
}

function Reserve() {
  const { user } = useAuth();

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + DAYS_AHEAD);

  const [form, setForm] = useState({
    name: user ? user.name : "",
    phone: "",
    date: toInputDate(today),
    guests: 2,
    time: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [booking, setBooking] = useState(null);

  const slots = getTimeSlots(form.date);
  const hours = getHours(form.date);
  const isToday = form.date === toInputDate(today);
  const nowHours = today.getHours() + today.getMinutes() / 60;

  // A slot is not available if it is today and already passed
  function isSlotPast(slot) {
    return isToday && slot.hours <= nowHours + 0.5;
  }

  /* ----- validation ----- */
  const errors = {};
  if (form.name.trim().length < 3) {
    errors.name = "Please enter your full name.";
  }
  if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit number starting with 98 or 97.";
  }
  if (!form.date) {
    errors.date = "Please choose a date.";
  } else if (form.date < toInputDate(today)) {
    errors.date = "Please choose today or a later date.";
  } else if (form.date > toInputDate(maxDate)) {
    errors.date = `We take bookings up to ${DAYS_AHEAD} days ahead.`;
  }
  if (form.guests > MAX_GUESTS) {
    errors.guests = `For more than ${MAX_GUESTS} guests, please call us directly.`;
  }
  if (!form.time) {
    errors.time = "Please choose a time slot.";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const cleanValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setForm((prev) => ({
      ...prev,
      [name]: cleanValue,
      // changing the date can make the chosen time invalid, so clear it
      ...(name === "date" ? { time: "" } : {}),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    const chosen = slots.find((slot) => slot.value === form.time);

    setBooking({
      code: "PB-R" + Date.now().toString().slice(-5),
      name: form.name.trim(),
      phone: form.phone,
      guests: form.guests,
      note: form.note.trim(),
      dateLabel: new Date(form.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      timeLabel: chosen ? chosen.label : "",
    });
  }

  function showError(field) {
    return submitted && errors[field];
  }

  /* ===== CONFIRMATION ===== */
  if (booking) {
    return (
      <section className="page container reserve-done">
        <span className="reserve-icon" aria-hidden="true">
          <CalendarCheck size={44} strokeWidth={1.5} />
        </span>
        <h1>Table Reserved!</h1>
        <p className="reserve-lead">
          Thank you, {booking.name.split(" ")[0]}. We're saving a table for you.
        </p>

        <div className="reserve-summary">
          <div>
            <span>Booking code</span>
            <strong>{booking.code}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{booking.dateLabel}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{booking.timeLabel}</strong>
          </div>
          <div>
            <span>Guests</span>
            <strong>{booking.guests}</strong>
          </div>
        </div>

        <p className="reserve-note-text">
          We'll call you at <strong>+977 {booking.phone}</strong> if anything
          changes. Your table is held for 15 minutes after the booking time.
        </p>

        <div className="reserve-actions">
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
          <Link to="/menu" className="btn btn-primary">
            See the Menu
          </Link>
        </div>
      </section>
    );
  }

  /* ===== FORM ===== */
  return (
    <section className="page container">
      <header className="menu-header">
        <p className="eyebrow">Book your seat</p>
        <h1>Reserve a Table</h1>
        <p className="menu-subtitle">
          Planning a meal with friends or family? Book a table and we'll keep it
          ready for you.
        </p>
      </header>

      <div className="reserve-layout">
        {/* LEFT: form */}
        <form className="reserve-card" onSubmit={handleSubmit} noValidate>
          <h2>Your Details</h2>

          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Sujal Tiwari"
                value={form.name}
                onChange={handleChange}
                className={showError("name") ? "invalid" : ""}
              />
              {showError("name") && (
                <p className="field-error" role="alert">{errors.name}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="phone">Mobile number</label>
              <div className="phone-input">
                <span className="phone-prefix">+977</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98XXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  className={showError("phone") ? "invalid" : ""}
                />
              </div>
              {showError("phone") && (
                <p className="field-error" role="alert">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={toInputDate(today)}
                max={toInputDate(maxDate)}
                value={form.date}
                onChange={handleChange}
                className={showError("date") ? "invalid" : ""}
              />
              {showError("date") && (
                <p className="field-error" role="alert">{errors.date}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                name="guests"
                className="sort-select guest-select"
                value={form.guests}
                onChange={handleChange}
              >
                {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TIME SLOTS */}
          <div className="field">
            <label htmlFor="time-group">
              Time <span className="optional">({hours.label})</span>
            </label>
            <div id="time-group" className="slot-grid">
              {slots.map((slot) => {
                const past = isSlotPast(slot);
                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={past}
                    className={`slot ${form.time === slot.value ? "selected" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, time: slot.value }))}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {slots.every(isSlotPast) && (
              <p className="field-hint slot-hint">
                No slots left today. Please choose another date.
              </p>
            )}
            {showError("time") && (
              <p className="field-error" role="alert">{errors.time}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="note">
              Special request <span className="optional">(optional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows="3"
              maxLength="200"
              placeholder="e.g. Window seat, birthday celebration"
              value={form.note}
              onChange={handleChange}
            ></textarea>
            <p className="field-hint">{form.note.length}/200</p>
          </div>

          <button type="submit" className="btn btn-primary reserve-btn">
            Reserve Table
          </button>
          <p className="form-footnote">
            No payment needed. We'll call you only if something changes.
          </p>
        </form>

        {/* RIGHT: info */}
        <aside className="reserve-info">
          <h2>Opening Hours</h2>
          <ul className="info-list">
            <li>
              <Clock size={16} aria-hidden="true" />
              <span>Sun – Fri: 7:00 AM – 9:00 PM</span>
            </li>
            <li>
              <Clock size={16} aria-hidden="true" />
              <span>Saturday: 8:00 AM – 10:00 PM</span>
            </li>
          </ul>

          <h2 className="info-heading">Good to Know</h2>
          <ul className="info-list">
            <li>
              <CalendarCheck size={16} aria-hidden="true" />
              <span>Your table is held for 15 minutes.</span>
            </li>
            <li>
              <Users size={16} aria-hidden="true" />
              <span>For more than {MAX_GUESTS} guests, please call us.</span>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <span>Questions? +977-98XXXXXXXX</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default Reserve;