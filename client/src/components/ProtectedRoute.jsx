import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only lets the admin through. Everyone else is sent to the login page.
function ProtectedRoute({ children }) {
  const { isAdmin, checking } = useAuth();
  const location = useLocation();

  // still asking the backend "who is logged in?"
  if (checking) {
    return (
      <section className="page container">
        <div className="menu-status">
          <div className="spinner" aria-hidden="true"></div>
          <p>Checking login…</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    // remember where they wanted to go, so we can return after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;