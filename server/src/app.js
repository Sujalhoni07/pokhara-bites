const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const config = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// behind a hosting proxy (Render, Railway…), so the rate limiter sees real IPs
if (config.isProduction) {
  app.set("trust proxy", 1);
}

/* ----- global middleware ----- */
app.use(helmet()); // security headers
app.use(express.json({ limit: "10kb" })); // reject huge bodies
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientUrl, // only our frontend may call this API
    credentials: true, // allow cookies
  })
);

/* ----- routes ----- */
app.use("/api", routes);

/* ----- errors (must be last) ----- */
app.use(notFound);
app.use(errorHandler);

module.exports = app;