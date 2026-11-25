/* PostgreSQL error codes we handle on purpose */
const PG_ERRORS = {
  UNIQUE_VIOLATION: "23505", // e.g. the email is already used
    FOREIGN_KEY_VIOLATION: "23503", // e.g. a category that does not exist
};

// Is this a valid UUID? (our ids are UUIDs)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

module.exports = { PG_ERRORS, isUuid };
