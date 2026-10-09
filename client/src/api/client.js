const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * An error from the API, with the HTTP status code.
 * status 0 means the server could not be reached at all.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * The ONE function that talks to our own backend.
 * - always sends the login cookie (credentials: "include")
 * - sends and reads JSON
 * - turns every failure into an ApiError with a readable message
 */
export async function apiRequest(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Please check your connection.", 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || "Something went wrong.", response.status);
  }

  return data;
}