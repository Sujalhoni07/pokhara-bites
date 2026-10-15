import { useEffect, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  Users,
  Clock,
  CalendarClock,
  Phone,
  CalendarX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllReservations,
  updateReservationStatus,
} from "../../api/reservations.api";
import {
  formatDate,
  formatTime,
  toDateString,
  isUpcoming,
} from "../../utils/dateFormat";

/* ===== SETTINGS ===== */

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

// Which buttons each status shows (rules as data, not as many if/else)
const ACTIONS = {
  pending: [
    { status: "confirmed", label: "Confirm", kind: "confirm" },
    { status: "cancelled", label: "Cancel", kind: "cancel" },
  ],
  confirmed: [
    { status: "completed", label: "Complete", kind: "complete" },
    { status: "cancelled", label: "Cancel", kind: "cancel" },
  ],
  cancelled: [],
  completed: [],
};

const FILTERS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "pending", label: "Pending" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

function matchesFilter(reservation, filter, today) {
  switch (filter) {
    case "today":
      return reservation.date === today;
    case "upcoming":
      return isUpcoming(reservation) && reservation.status !== "cancelled";
    case "pending":
      return reservation.status === "pending";
    case "past":
      return !isUpcoming(reservation);
    default:
      return true; // "all"
  }
}

/* ===== SMALL COMPONENT ===== */

function StatCard({ Icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

/* ===== PAGE ===== */

function Dashboard() {
  const { user, logout } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllReservations();
      setReservations(data.reservations);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function changeStatus(reservation, action) {
    if (
      action.kind === "cancel" &&
      !window.confirm(`Cancel ${reservation.name}'s booking (${reservation.code})?`)
    ) {
      return;
    }

    setBusyId(reservation.id);
    setActionError("");
    try {
      const data = await updateReservationStatus(reservation.id, action.status);
      // replace only the changed booking
      setReservations((prev) =>
        prev.map((item) => (item.id === reservation.id ? data.reservation : item))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  /* ----- calculated values (no extra state) ----- */
  const today = toDateString();
  const active = reservations.filter((r) => r.status !== "cancelled");
  const todayBookings = active.filter((r) => r.date === today);

  const stats = [
    { Icon: CalendarDays, label: "Bookings today", value: todayBookings.length },
    {
      Icon: Users,
      label: "Guests today",
      value: todayBookings.reduce((sum, r) => sum + r.guests, 0),
    },
    {
      Icon: Clock,
      label: "Waiting for confirmation",
      value: reservations.filter((r) => r.status === "pending" && isUpcoming(r)).length,
    },
    {
      Icon: CalendarClock,
      label: "Upcoming bookings",
      value: active.filter(isUpcoming).length,
    },
  ];

  const query = search.trim().toLowerCase();

  const filtered = reservations
    .filter((r) => matchesFilter(r, filter, today))
    .filter(
      (r) =>
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.phone.includes(query)
    );

  // the server sends the soonest first; past bookings read better newest first
  const visible = filter === "past" ? [...filtered].reverse() : filtered;

  function countFor(id) {
    return reservations.filter((r) => matchesFilter(r, id, today)).length;
  }

  return (
    <section className="page container">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dash-sub">
            Logged in as {user.email}
            {lastUpdated &&
              ` · Updated ${lastUpdated.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`}
          </p>
        </div>
        <div className="dash-actions">
          <button
            className="btn btn-outline btn-icon"
            onClick={loadReservations}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button className="btn btn-outline" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* FILTERS + SEARCH */}
      <div className="dash-toolbar">
        <div className="category-tabs" role="group" aria-label="Filter reservations">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`tab ${filter === item.id ? "active" : ""}`}
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              {item.label}
              <span className="tab-count">{countFor(item.id)}</span>
            </button>
          ))}
        </div>

        <div className="search-box">
          <label htmlFor="res-search" className="sr-only">
            Search reservations
          </label>
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="res-search"
            type="search"
            placeholder="Name, code or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {actionError && (
        <p className="field-error form-error" role="alert">
          {actionError}
        </p>
      )}

      {/* LOADING (first time only) */}
      {loading && reservations.length === 0 && (
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading reservations…</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="menu-status">
          <p className="status-title">{error}</p>
          <button className="btn btn-primary" onClick={loadReservations}>
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && visible.length === 0 && (
        <div className="menu-status">
          <span className="status-icon" aria-hidden="true">
            <CalendarX size={30} />
          </span>
          <p className="status-title">No reservations here</p>
          <p>Try another filter or clear the search.</p>
        </div>
      )}

      {/* TABLE */}
      {!error && visible.length > 0 && (
        <div className="table-wrap">
          <table className="res-table">
            <thead>
              <tr>
                <th scope="col">Booking</th>
                <th scope="col">Date &amp; time</th>
                <th scope="col">Guest</th>
                <th scope="col">Party</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td data-label="Booking">
                    <span className="res-code">{r.code}</span>
                  </td>

                  <td data-label="Date & time">
                    <strong>{formatDate(r.date)}</strong>
                    {r.date === today && <span className="today-tag">Today</span>}
                    <br />
                    {formatTime(r.time)}
                  </td>

                  <td data-label="Guest">
                    {r.name}
                    <br />
                    <a href={`tel:+977${r.phone}`} className="phone-link">
                      <Phone size={12} aria-hidden="true" />
                      {r.phone}
                    </a>
                    {r.note && <p className="res-note">"{r.note}"</p>}
                  </td>

                  <td data-label="Party">{r.guests}</td>

                  <td data-label="Status">
                    <span className={`res-status ${r.status}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>

                  <td data-label="Actions">
                    {ACTIONS[r.status].length === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      <div className="row-actions">
                        {ACTIONS[r.status].map((action) => (
                          <button
                            key={action.status}
                            className={`action-btn ${action.kind}`}
                            disabled={busyId === r.id}
                            onClick={() => changeStatus(r, action)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Dashboard;