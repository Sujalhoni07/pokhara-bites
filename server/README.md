# Pokhara Bites – Backend API

Express API for the Pokhara Bites café website.
Currently handles **admin authentication**. Customers do not log in.

## Quick start

```bash
cd server
npm install
cp .env.example .env              # then fill in the values
node scripts/setAdminPassword.js "YourStrongPassword"
npm run dev                       # http://localhost:4000
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> nodemon does **not** restart when `.env` changes. Restart manually.

## Environment variables

| Variable | Example | Meaning |
|---|---|---|
| `PORT` | `4000` | API port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend allowed by CORS |
| `NODE_ENV` | `development` | `production` when deployed |
| `JWT_SECRET` | long random string | Signs login tokens. Keep secret. |
| `ADMIN_EMAIL` | `admin@pokharabites.com` | Admin login email |
| `ADMIN_PASSWORD_HASH` | `$2b$10$...` | Set with `setAdminPassword.js` |

The server refuses to start if a required variable is missing.

## Architecture

Feature modules with layers. Each layer has one job:

```
routes → validation → controller → service → repository
```

| Layer | Job | Touches req/res? | Touches database? |
|---|---|---|---|
| `*.routes.js` | URL + middleware chain | yes | no |
| `*.validation.js` | Check and clean input | no | no |
| `*.controller.js` | Read request, call service, send response | yes | no |
| `*.service.js` | Business logic | no | no |
| `*.repository.js` | Read/write data | no | **yes (only here)** |

Rules:
- Read settings from `config/env.js`, never from `process.env` directly.
- Throw `new AppError(message, statusCode)` for expected errors.
- Wrap async controllers in `asyncHandler`.
- Protect routes with `requireAuth` and `requireRole("admin")`.

## Folder structure

```
src/
├── server.js           starts the server
├── app.js              Express app + global middleware
├── routes.js           mounts all modules under /api
├── config/env.js       settings (loaded and checked once)
├── middleware/         requireAuth, validate, rateLimit, errorHandler
├── utils/              AppError, asyncHandler, authCookie
└── modules/
    ├── auth/           login, logout, me
    └── admin/          admin routes + admin repository
```

## API

All responses are JSON. Errors are always `{ "message": "..." }`.
Requests from the browser must use `credentials: "include"`.

| Method | Endpoint | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| GET | `/api/health` | – | – | `{ status: "ok" }` | – |
| POST | `/api/auth/login` | – | `{ email, password }` | `{ admin: { email, role } }` + cookie | 400, 401, 429 |
| POST | `/api/auth/logout` | – | – | `{ message }` + clears cookie | – |
| GET | `/api/auth/me` | cookie | – | `{ admin: { id, email, role } }` | 401 |
| GET | `/api/admin/summary` | admin | – | `{ message, role }` | 401, 403 |

## How authentication works

1. `POST /api/auth/login` → the password is checked against a **bcrypt hash**.
2. If correct, a **JWT** (8 hours) is stored in an **httpOnly cookie** `pb_token`.
3. `requireAuth` verifies the cookie and sets `req.user = { id, email, role }`.
4. `requireRole("admin")` blocks non-admins (403).
5. `POST /api/auth/logout` clears the cookie.

Security: bcrypt hashing, httpOnly cookie, same error for wrong email/password,
login rate limit (5 failures / 15 min), helmet headers, 10 kb body limit,
CORS limited to `CLIENT_URL`.

## Adding a new module (example: orders)

1. Create `src/modules/orders/` with:
   - `order.repository.js` – database queries
   - `order.service.js` – business logic
   - `order.controller.js` – req/res
   - `order.validation.js` – input checks
   - `order.routes.js` – URLs
2. Mount it in `src/routes.js`: `router.use("/orders", orderRoutes);`
3. Protect admin-only routes with `requireAuth, requireRole("admin")`.

## Backend team tasks

| # | Task | Where |
|---|---|---|
| 1 | Add a database (MongoDB or PostgreSQL) | new `src/config/db.js` |
| 2 | Store admins in the database | `admin.repository.js` → `findByEmail()` |
| 3 | Save customer orders (`POST /api/orders`) | new `modules/orders/` |
| 4 | Save table reservations (`POST /api/reservations`) | new `modules/reservations/` |
| 5 | Admin: list orders and reservations, update status | `modules/admin/` |
| 6 | Deploy the API (Render/Railway) | see Deployment |
| 7 | Tests for the auth flow | new `tests/` folder |

## Deployment checklist

- [ ] `NODE_ENV=production`, strong `JWT_SECRET`, `CLIENT_URL` = deployed frontend
- [ ] Frontend and API on different domains won't share cookies with `sameSite: "lax"`.
  Proxy `/api` through the frontend host. Vercel `client/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-API-URL/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Known limitations

- Logout clears the cookie, but a JWT stays valid until it expires (8h).
- One admin from `.env` until the database is added.