require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const { requireAuth } = require("./middleware/requireAuth");

const app = express();

/* ----- middleware ----- */
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // only our frontend may call this API
    credentials: true, // allow cookies
  })
);

/* ----- routes ----- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

// Example of a protected admin route.
// TODO (backend team): add the real admin routes here.
app.get("/api/admin/summary", requireAuth, (req, res) => {
  res.json({
    message: `Welcome back, ${req.admin.email}`,
    role: req.admin.role,
  });
});

/* ----- start ----- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});