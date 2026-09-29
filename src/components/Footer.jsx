import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Pokhara <span>Bites</span>
          </Link>
          <p>
            Warm food, good coffee and a cozy corner by the lake.
            A café in the heart of Lakeside, Pokhara.
          </p>
        </div>

        <div>
          <h2 className="footer-title">Opening Hours</h2>
          <ul>
            <li>Sun – Fri: 7:00 AM – 9:00 PM</li>
            <li>Saturday: 8:00 AM – 10:00 PM</li>
          </ul>
        </div>

        <div>
          <h2 className="footer-title">Contact</h2>
          <address>
            Lakeside, Pokhara, Nepal<br />
            +977-98XXXXXXXX<br />
            hello@pokharabites.com
          </address>
        </div>

        <div>
          <h2 className="footer-title">Quick Links</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Pokhara Bites. Designed & developed by Sujal Tiwari.</p>
      </div>
    </footer>
  );
}

export default Footer;