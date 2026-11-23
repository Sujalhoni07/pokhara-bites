# Pokhara Bites

A full-stack web application for **Pokhara Bites**, a café in Lakeside, Pokhara.
Customers can browse the menu, order food, and reserve tables.
Café staff manage reservations from an admin dashboard.

> Built by **Sujal Tiwari** during a Full Stack Developer internship at Pocomat Devineers.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Lucide icons, plain CSS with design tokens |
| Backend | Node.js, Express 5 |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing, role-based access |
| Security | Helmet, CORS, rate limiting, server-side validation |
| Database | JSON files for now → **PostgreSQL** (in progress) |

## Project structure

```
pokhara-bites/
├── client/    React frontend  → see client/README.md
└── server/    Express API     → see server/README.md
```

## Run it locally

You need **Node.js 20+**. Open two terminals.

```bash
# Terminal 1 – backend
cd server
npm install
cp .env.example .env          # then fill in the values
npm run dev                   # http://localhost:4000

# Terminal 2 – frontend
cd client
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

## Features

**Customers**
- Browse the menu with search, category filters, veg-only filter and sorting
- Cart (saved in the browser) and checkout for delivery or pickup
- Sign up / log in, reserve a table, view and cancel bookings

**Admin**
- Log in to the dashboard
- See today's bookings and guests, filter and search reservations
- Confirm, complete or cancel reservations

## Roadmap

- [x] Step 0 – Clean-up and documentation
- [ ] Step 1 – PostgreSQL database
- [ ] Step 2 – Reservation business rules + API tests
- [ ] Step 3 – Menu module (real menu from the database, admin management)
- [ ] Step 4 – Orders module (prices calculated on the server)
- [ ] Step 5 – Design system and UI polish
- [ ] Step 6 – Production readiness and deployment

## Git workflow

- `main` always works.
- Every change is made on its own branch, for example `feature/orders-api` or `chore/cleanup`.
- Changes reach `main` through a **pull request** on GitHub.