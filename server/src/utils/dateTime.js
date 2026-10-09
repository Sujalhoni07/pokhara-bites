const config = require("../config/env");

/**
 * Date helpers that always use the café's time zone (Asia/Kathmandu),
 * no matter where the server runs.
 */

function nowInCafe() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type).value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`, // "2026-10-09"
    hours: Number(get("hour")) + Number(get("minute")) / 60, // 13.5 = 1:30 PM
  };
}

// "2026-10-09" + 30 days → "2026-11-08"
function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// 0 = Sunday ... 6 = Saturday, for a "YYYY-MM-DD" date
function weekdayOf(dateString) {
  return new Date(`${dateString}T00:00:00Z`).getUTCDay();
}

module.exports = { nowInCafe, addDays, weekdayOf };