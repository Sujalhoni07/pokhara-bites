import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { pathname, hash } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAboutActive = pathname === "/" && hash === "#about";

  const closeMenu = () => setMenuOpen(false);

  // If we're already on /#about, clicking About again should still scroll there
  function handleAboutClick() {
    closeMenu();
    if (pathname === "/") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="navbar">
      <nav className="navbar-inner container" aria-label="Main navigation">
        {/* Logo: NOT an h1, because the navbar is on every page */}
        <Link to="/" className="logo" onClick={closeMenu}>
          Pokhara <span>Bites</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            
            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) => (isActive && !isAboutActive ? "active" : "")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/reserve" onClick={closeMenu}>
              Reserve
            </NavLink>
          </li>
          <li>
            <Link
              to="/#about"
              onClick={handleAboutClick}
              className={isAboutActive ? "active" : ""}
            >
              About
            </Link>
          </li>
          <li>
            <NavLink to="/cart" onClick={closeMenu}>
              Cart
            </NavLink>
          </li>
        </ul>

        <div className="nav-actions">
          {user ? (
            <div className="user-box">
              <span className="user-name">Hi, {user.name.split(" ")[0]}</span>
              <button className="logout-btn" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link" onClick={closeMenu}>
              Log in
            </Link>
          )}

          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Cart with ${totalItems} items`}
            onClick={closeMenu}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span key={totalItems} className="cart-badge">
                {totalItems}
              </span>
            )}
          </Link>

          <Link to="/menu" className="btn btn-primary nav-cta" onClick={closeMenu}>
            Order Now
          </Link>

          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;