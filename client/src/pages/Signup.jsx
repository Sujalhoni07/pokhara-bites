import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(98|97)\d{8}$/;

function Signup() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  /* ----- the same rules as the backend ----- */
  const errors = {};
  if (form.name.trim().length < 3) {
    errors.name = "Please enter your full name.";
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "Enter a 10-digit number starting with 98 or 97.";
  }
  if (form.password.length < 8) {
    errors.password = "Your password must be at least 8 characters.";
  }

  function showError(field) {
    return submitted && errors[field];
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const cleanValue = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    const { error } = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      password: form.password,
    });
    setBusy(false);

    if (error) {
      setServerError(error);
      return;
    }

    navigate(from && !from.startsWith("/admin") ? from : "/", { replace: true });
  }

  // already logged in
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return (
    <section className="page container auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Reserve tables and keep track of your bookings.</p>

        <form onSubmit={handleSubmit} noValidate>
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
            {showError("name") && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={showError("email") ? "invalid" : ""}
            />
            {showError("email") && <p className="field-error">{errors.email}</p>}
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
                autoComplete="tel-national"
                placeholder="98XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                className={showError("phone") ? "invalid" : ""}
              />
            </div>
            {showError("phone") && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className={showError("password") ? "invalid" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {showError("password") && <p className="field-error">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="field-error form-error" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn btn-primary auth-btn" disabled={busy}>
            {busy ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" state={{ from }}>
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;