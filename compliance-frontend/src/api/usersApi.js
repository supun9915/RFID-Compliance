import { GET, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all users.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getUsers = async () => {
  const response = await request("/users", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch users";

    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
};

/**
 * Create a new user.
 * @param {{ username, email, password, firstName, lastName, contactNumber, nic, district, province, roleId, scanCenterId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createUser = async (userData) => {
  const response = await request("/users", POST, userData);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to create user";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update an existing user.
 * @param {{ id, username, email, password, firstName, lastName, contactNumber, nic, district, province, roleId, scanCenterId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateUser = async (userData) => {
  const { id, ...payload } = userData;
  const response = await request(`/users/${id}`, PUT, payload);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update user";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Delete a user.
 * @param {string} userId
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const deleteUser = (userId) => request(`/users/${userId}`, "DELETE");

/**
 * Get users by role.
 * @param {string} roleName - The name of the role (e.g., "admin", "owner", "entrance")
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 * Note: This endpoint is assumed to exist on the backend. Adjust the URL as needed.
 */
export const getUsersByRole = (roleName) =>
  request("/users", GET, undefined, { role: roleName });

/**
 * Fetch all roles.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getRoles = async () => {
  const response = await request("/roles", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch roles";
    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
};
