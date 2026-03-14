import { GET, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all users.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getUsers = () => request("/users", GET);

/**
 * Create a new user.
 * @param {{ username, email, password, firstName, lastName, contactNumber, nic, roleId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createUser = (userData) => request("/users", POST, userData);

/**
 * Update an existing user.
 * @param {{ id, username, email, password, firstName, lastName, contactNumber, nic, roleId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateUser = (userData) => request("/users", PUT, userData);

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
  request(`/users?role=${roleName}`, GET);
