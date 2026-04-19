import { GET, POST, request } from "./apiAdapter";

/**
 * Login with username and password.
 * On success, persists the token and user info to localStorage.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const loginUser = async (username, password) => {
  const response = await request("/auth/login", POST, { username, password });

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Login failed. Please try again.";
    return { success: false, message };
  }

  // API shape: { success, message, data: { token, type, id, firstName, ... }, timestamp }
  const payload = response.data || response;
  const token =
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    response.token;

  if (token) {
    localStorage.setItem("token", token);
  }
  localStorage.setItem("user", JSON.stringify(payload));

  return { success: true, data: payload };
};

/**
 * Calls the backend logout API, then clears local auth data.
 * Always clears localStorage even if the API call fails.
 */
export const logoutUser = async () => {
  try {
    await request("/auth/logout", POST, undefined);
  } catch (_) {
    // Ignore errors – we still want to clear local state
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

/**
 * Returns true if a token exists in localStorage.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Get current user profile.
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const getUserProfile = async () => {
  const response = await request("/users/profile", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch user profile";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};
