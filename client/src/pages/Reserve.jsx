import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Clock, Users, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createReservation } from "../api/reservations.api";
import { formatDate, formatTime } from "../utils/dateFormat";

const PHONE_PATTERN = /^(98|97)\d{8}$/;
const MAX_GUESTS = 20;
const DAYS_AHEAD = 30;
const LARGE_GROUP = 8;

/* ===== DATE HELPERS (local Nepal time, not UTC) ===== */

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
  return new Date(dateString + "T00:00");
}

/* ===== OPENING HOURS (the backend checks the same rules) ===== */

function getHours(dateString) {
  const isSaturday = parseLocalDate(dateString).getDay() === 6;
  return {
    open: isSaturday ? 8 : 7,
    close: isSaturday ? 22 : 21,
    label: isSaturday ? "8:00 AM – 10:00 PM" : "7:00 AM – 9:00 PM",
  };
}

function getTimeSlots(dateString) {
  const { open, close } = getHours(dateString);
  const slots = [];

  for (let hour = open; hour <= close - 1; hour++) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      slots.push({ value, label: formatTime(value), hours: hour + minute / 60 });
    }
  }

  return slots;
}

function Reserve() {
  const { user } = useAuth();

  const today = new Date();
  const todayString = toInputDate(today);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + DAYS_AHEAD);
  const maxDateString = toInputDate(maxDate);

  // pre-filled from the customer's account
  const emptyForm = {
    name: user?.name || "",
    phone: user?.phone || "",
    date: todayString,
    guests: 2,
    time: "",
    note: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [booking, setBooking] = useState(null);

  const slots = form.date ? getTimeSlots(form.date) : [];
  const hours = form.date ? getHours(form.date) : null;
  const isToday = form.date === todayString;
  const nowHours = today.getHours() + today.getMinutes() / 60;
  const guests = Number(form.guests);

  function isSlotPast(slot) {
    return isToday && slot.hours <= nowHours + 0.5;
  }

  /* ----- validation (same rules as the backend) ----- */
  const errors = {};
  if (form.name.trim().length < 3) {
    errors.name = "Please enter your full name.";
  }
  if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit number starting with 98 or 97.";
  }
  if (!form.date) {
    errors.date = "Please choose a date.";
  } else if (form.date < todayString) {
    errors.date = "Please choose today or a later date.";
  } else if (form.date > maxDateString) {
    errors.date = `We take bookings up to ${DAYS_AHEAD} days ahead.`;
  }
  if (guests < 1 || guests > MAX_GUESTS) {
    errors.guests = `For more than ${MAX_GUESTS} guests, please call us directly.`;
  }
  if (!form.time) {
    errors.time = "Please choose a time slot.";
  } else {
    const chosenSlot = slots.find((slot) => slot.value === form.time);
    if (!chosenSlot || isSlotPast(chosenSlot)) {
      errors.time = "This time is no longer available. Please choose another.";
    }
  }

  function showError(field) {
    return submitted && errors[field];
  }

  /* ----- events ----- */
  function handleChange(e) {
    const { name, value } = e.target;
    const cleanValue = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setForm((prev) => ({
      ...prev,
      [name]: cleanValue,
      ...(name === "date" ? { time: "" } : {}), // a new date can make the time invalid
    }));
    setServerError("");
  }

  function chooseTime(value) {
    setForm((prev) => ({ ...prev, time: value }));
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const data = await createReservation({
        name: form.name.trim(),
        phone: form.phone,
        date: form.date,
        time: form.time,
        guests,
        note: form.note.trim(),
      });
      setBooking(data.reservation); // the real booking from the server
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function bookAnother() {
    setBooking(null);
    setSubmitted(false);
    setServerError("");
    setForm(emptyForm);
  }

  /* ===== CONFIRMATION ===== */
  if (booking) {
    return (
      <section className="page container reserve-done">
        <span className="reserve-icon" aria-hidden="true">
          <CalendarCheck size={44} strokeWidth={1.5} />
        </span>
        <h1>Booking Received!</h1>
        <p className="reserve-lead">
          Thank you, {booking.name.split(" ")[0]}. Your booking is waiting for the
          café to confirm it.
        </p>

        <div className="reserve-summary">
          <div>
            <span>Booking code</span>
            <strong>{booking.code}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{formatDate(booking.date)}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{formatTime(booking.time)}</strong>
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
          <button className="btn btn-outline" onClick={bookAnother}>
            Book Another Table
          </button>
          <Link to="/my-reservations" className="btn btn-primary">
            My Reservations
          </Link>
        </div>
      </section>
    );
  }

  /* ===== FORM ===== */
  const noSlotsLeft = slots.length > 0 && slots.every(isSlotPast);

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
                value={form.name}
                onChange={handleChange}
                className={showError("name") ? "invalid" : ""}
              />
              {showError("name") && <p className="field-error">{errors.name}</p>}
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
              {showError("phone") && <p className="field-error">{errors.phone}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayString}
                max={maxDateString}
                value={form.date}
                onChange={handleChange}
                className={showError("date") ? "invalid" : ""}
              />
              {showError("date") && <p className="field-error">{errors.date}</p>}
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
              {showError("guests") && <p className="field-error">{errors.guests}</p>}
            </div>
          </div>

          <div className="field">
            <p className="slot-title">
              Time {hours && <span className="optional">({hours.label})</span>}
            </p>

            {!form.date ? (
              <p className="field-hint slot-hint">Choose a date to see the times.</p>
            ) : (
              <div className="slot-grid" role="group" aria-label="Choose a time">
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={isSlotPast(slot)}
                    aria-pressed={form.time === slot.value}
                    className={`slot ${form.time === slot.value ? "selected" : ""}`}
                    onClick={() => chooseTime(slot.value)}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            {noSlotsLeft && (
              <p className="field-hint slot-hint">
                No slots left today. Please choose another date.
              </p>
            )}
            {showError("time") && <p className="field-error">{errors.time}</p>}
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

          {guests >= LARGE_GROUP && (
            <div className="payment-note">
              <Users size={20} aria-hidden="true" />
              <p>
                <strong>Large group booking</strong>
                <br />
                For {guests} guests, our team will call you to confirm the table
                and discuss a small advance deposit.
              </p>
            </div>
          )}

          {serverError && (
            <p className="field-error form-error" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn btn-primary reserve-btn" disabled={busy}>
            {busy ? "Booking…" : "Reserve Table"}
          </button>
          <p className="form-footnote">
            No payment needed. You can cancel from "My Reservations".
          </p>
        </form>

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