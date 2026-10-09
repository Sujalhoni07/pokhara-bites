# Pokhara Bites – Frontend

React + Vite website for the Pokhara Bites café.
Customers browse the menu, order and reserve tables without an account.
Café staff log in at `/login` to reach the admin dashboard (`/admin`).

## Quick start

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

The backend (`../server`) must be running for admin login.

## Environment

| Variable | Example | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Backend URL. Restart Vite after changing it. |

## Folder structure

```
src/
├── main.jsx              providers (Router, Theme, Auth, Cart)
├── App.jsx               layout + all routes
├── api/                  every server call lives here
│   ├── client.js         apiRequest(): our backend (cookie, JSON, errors)
│   ├── auth.api.js       login, logout, current admin
│   ├── admin.api.js      admin-only endpoints
│   └── menu.api.js       menu from DummyJSON + our own dishes
├── components/           reusable UI (Navbar, Footer, FoodCard, ProtectedRoute…)
├── context/              shared state: Auth, Cart, Theme
├── data/menu.js          our dishes, prices, veg detection, API → menu item
├── pages/                public screens
│   └── admin/            Login, Dashboard
└── utils/                small helpers (formatPrice)
```

## Conventions

- **Pages never call `fetch()` directly.** Add a function in `src/api/` and import it.
- Calls to our backend use `apiRequest()`, which sends the login cookie and throws an
  `ApiError` with a readable `message` and `status`.
- Shared data and helpers go in `src/data/`, never imported from another page.
- Admin-only pages go in `pages/admin/` and are wrapped in `<ProtectedRoute>`.
- The real security is on the backend. `ProtectedRoute` only improves the experience.

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/menu`, `/menu/:id` | Menu, dish details | Public |
| `/cart`, `/checkout`, `/order-success` | Ordering | Public |
| `/reserve` | Table reservation | Public |
| `/login` | Admin login | Public |
| `/admin` | Admin dashboard | Admin only |

## Not connected to the backend yet

- Orders and reservations are shown to the customer but not saved.
  When the backend adds `POST /api/orders` and `POST /api/reservations`,
  add `orders.api.js` and `reservations.api.js` and call them from
  `Checkout.jsx` and `Reserve.jsx`.