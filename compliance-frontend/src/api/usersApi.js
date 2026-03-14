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
