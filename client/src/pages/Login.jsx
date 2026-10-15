import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from; // the page that sent us here, if any

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // where each role should land after logging in
  function destinationFor(account) {
    if (account.role === "admin") {
      return from?.startsWith("/admin") ? from : "/admin";
    }
    return from && !from.startsWith("/admin") ? from : "/";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    const { user: account, error: message } = await login(form.email, form.password);
    setBusy(false);

    if (message) {
      setError(message);
      return;
    }

    navigate(destinationFor(account), { replace: true });
  }

  // already logged in → no need to see this page
  if (user) {
    return <Navigate to={destinationFor(user)} replace />;
  }

  return (
    <section className="page container auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to reserve tables and see your bookings.</p>

        {from && (
          <p className="auth-notice">
            {from === "/reserve"
              ? "Please log in to reserve a table."
              : "Please log in to continue."}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <p className="field-error form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary auth-btn" disabled={busy}>
            {busy ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          New here?{" "}
          <Link to="/signup" state={{ from }}>
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;