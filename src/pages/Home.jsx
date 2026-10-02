import { Link } from "react-router-dom";
import {
  Leaf,
  Bike,
  Mountain,
  Wifi,
  ChevronDown,
  Check,
  Coffee,
} from "lucide-react";


/* ===== DATA ===== */
const features = [
  { Icon: Leaf, title: "Fresh & Local", text: "Vegetables and meat from local farms around Pokhara." },
  { Icon: Bike, title: "Fast Delivery", text: "Hot food at your door in about 30 minutes in Lakeside." },
  { Icon: Mountain, title: "Lake View Seating", text: "Relax with a view of Phewa Lake and the mountains." },
  { Icon: Wifi, title: "Free Wi-Fi", text: "A calm corner to work, study or meet friends." },
];

const featuredDishes = [
  { id: 1, name: "Chicken Momo", description: "Juicy steamed dumplings with spicy tomato achar.", price: 250, image: "/images/momo.jpg" },
  { id: 2, name: "Thakali Set", description: "Rice, dal, gundruk, pickle and curry. The full Himalayan plate.", price: 550, image: "/images/thakali.jpg" },
  { id: 3, name: "Café Latte", description: "Smooth espresso with silky steamed milk.", price: 220, image: "/images/coffee.jpg" },
  { id: 4, name: "Chocolate Cake", description: "Rich and moist, baked fresh every morning.", price: 280, image: "/images/cake.jpg" },
];

const aboutPoints = [
  "Traditional Nepali recipes",
  "Freshly roasted Nepali coffee",
  "Friendly local team",
];

/* ===== HELPER: is the café open right now? ===== */
function getOpenStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday ... 6 = Saturday
  const time = now.getHours() + now.getMinutes() / 60;

  const isSaturday = day === 6;
  const openTime = isSaturday ? 8 : 7;
  const closeTime = isSaturday ? 22 : 21;

  return {
    isOpen: time >= openTime && time < closeTime,
    hours: isSaturday ? "8 AM – 10 PM" : "7 AM – 9 PM",
  };
}

/* ===== COMPONENT ===== */
function Home() {
  const { isOpen, hours } = getOpenStatus();

  return (
    <>
      {/* 1. HERO (full screen) */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-content">
            <p className="eyebrow">Lakeside · Pokhara</p>
            <h1>
              Taste of Pokhara, <span>served warm.</span>
            </h1>
            <p className="hero-text">
              From steaming momo to slow-brewed coffee, every plate is made
              fresh with local ingredients. Order online for delivery or pickup.
            </p>

            <div className="hero-buttons">
              <Link to="/menu" className="btn btn-primary">Order Now</Link>
              <a href="#about" className="btn btn-outline">Our Story</a>
            </div>

            <ul className="hero-stats">
              <li><strong>30 min</strong><span>Delivery</span></li>
              <li><strong>7 AM</strong><span>Opens daily</span></li>
              <li><strong>100%</strong><span>Local ingredients</span></li>
            </ul>
          </div>

          <div className="hero-image">
            <img
              src="/images/hero.jpg"
              alt="Warm, cozy café interior with hanging lights and wooden shelves"
            />
            <div className={`status-badge ${isOpen ? "open" : "closed"}`}>
              <span className="dot" aria-hidden="true"></span>
              {isOpen ? "Open now" : "Closed now"} · {hours}
            </div>
          </div>
        </div>

        <a href="#features" className="scroll-hint" aria-label="Scroll to learn more">
          <ChevronDown size={22} aria-hidden="true" />
        </a>
      </section>

      {/* 2. WHY US */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Why Pokhara Bites</p>
            <h2>More than just a café</h2>
          </div>

          <div className="feature-grid">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="feature-card">
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={26} strokeWidth={1.75} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED DISHES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Our Favorites</p>
            <h2>Most Loved Dishes</h2>
            <p className="section-subtitle">
              The plates our regulars order again and again.
            </p>
          </div>

          <div className="dish-grid">
            {featuredDishes.map((dish) => (
              <article key={dish.id} className="dish-card">
                <div className="dish-image">
                  <img src={dish.image} alt={dish.name} loading="lazy" />
                </div>
                <div className="dish-body">
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                  <div className="dish-footer">
                    <span className="price">Rs. {dish.price}</span>
                    <Link to="/menu" className="dish-link">Order →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="center">
            <Link to="/menu" className="btn btn-outline">See Full Menu</Link>
          </div>
        </div>
      </section>

      {/* 4. ABOUT */}
      <section id="about" className="section about">
        <div className="about-inner container">
          <div className="about-image">
            <img
              src="/images/cafe.jpg"
              alt="Café counter with a glowing CAFE sign and menu board"
              loading="lazy"
            />
            <div className="about-badge">
              <span className="about-badge-icon" aria-hidden="true">
                <Coffee size={20} strokeWidth={2} />
              </span>
              <div>
                <strong>Nepali Coffee</strong>
                <small>Freshly roasted every week</small>
              </div>
            </div>
          </div>

          <div className="about-content">
            <p className="eyebrow">Our Story</p>
            <h2>A cozy corner by Phewa Lake</h2>
            <p className="about-text">
              Pokhara Bites started with a simple idea: serve honest, homemade
              food in a place that feels warm. Travelers, students and families
              come here to eat well, slow down and enjoy the lake breeze.
            </p>
            <ul className="about-list">
              {aboutPoints.map((point) => (
                <li key={point}>
                  <span className="check-icon" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link to="/menu" className="btn btn-primary">Explore the Menu</Link>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>Hungry? Your momo is 30 minutes away.</h2>
            <p>Order online in a few clicks. Pay on delivery.</p>
            <Link to="/menu" className="btn btn-primary">Order Now</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;