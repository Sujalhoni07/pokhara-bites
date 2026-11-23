# Pokhara Bites – Frontend

React + Vite website for the Pokhara Bites café.
Customers browse the menu and order without an account.
To reserve a table, customers sign up or log in.
The admin logs in on the same `/login` page and is taken to the dashboard (`/admin`).

## Quick start

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

The backend (`../server`) must be running for login, sign-up and reservations.

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
│   ├── auth.api.js       register, login, logout, current user
│   ├── reservations.api.js  customer + admin reservation calls
│   ├── admin.api.js      admin-only endpoints
│   └── menu.api.js       menu from DummyJSON + our own dishes (to be replaced in Step 3)
├── components/           reusable UI (Navbar, Footer, FoodCard, ProtectedRoute…)
├── context/              shared state: Auth, Cart, Theme
├── data/menu.js          our dishes, prices, veg detection, API → menu item
├── pages/                public screens
│   └── admin/            Dashboard
└── utils/                small helpers (formatPrice, dateFormat)
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
| `/login`, `/signup` | Log in (customer or admin), sign up | Public |
| `/reserve` | Table reservation | Customer only |
| `/my-reservations` | Customer's bookings | Customer only |
| `/admin` | Admin dashboard | Admin only |

## Not connected to the backend yet

- **Menu** comes from DummyJSON plus `data/menu.js`. Step 3 moves it to `GET /api/menu`.
- **Orders** are not saved. `Checkout.jsx` only simulates sending the order.
  Step 4 adds `POST /api/orders`, where the server calculates the prices and total.