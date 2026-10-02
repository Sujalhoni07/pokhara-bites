import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <span className="mb-7 grid h-28 w-28 place-items-center rounded-full border border-accent/25 bg-accent/10 text-accent">
        <UtensilsCrossed size={44} strokeWidth={1.5} />
      </span>

      <p className="mb-3 font-heading text-6xl font-bold text-accent">404</p>

      <h1 className="mb-4 font-heading text-4xl text-cream">Page Not Found</h1>

      <p className="mb-9 max-w-md text-muted">
        This page is not on our menu. It may have been moved, or the link might
        be wrong. Let's get you back to the good food.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="rounded-full border-[1.5px] border-accent px-7 py-3 font-semibold text-accent transition hover:bg-accent hover:text-bg"
        >
          Back to Home
        </Link>
        <Link
          to="/menu"
          className="rounded-full bg-accent px-7 py-3 font-semibold text-bg transition hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          See Our Menu
        </Link>
      </div>
    </section>
  );
}

export default NotFound;