import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guards a page.
 * - not logged in → the login page (and back here afterwards)
 * - wrong role    → the right home for that role
 *
 * This is for user experience only. The real security is on the backend.
 */
function ProtectedRoute({ role, children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  // still asking the backend "who is logged in?"
  if (checking) {
    return (
      <section className="page container">
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Checking your login…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;