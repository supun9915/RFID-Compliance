import { GET, POST, PUT, DELETE, request } from "./apiAdapter";

/**
 * Fetch all vehicle makes.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getVehicleMakes = () => request("/vehicle-makes", GET);

/**
 * Fetch a vehicle make by ID.
 * @param {number} id
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const getVehicleMakeById = (id) => request(`/vehicle-makes/${id}`, GET);

/**
 * Create a new vehicle make.
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createVehicleMake = (data) =>
  request("/vehicle-makes", POST, data);

/**
 * Update an existing vehicle make.
 * @param {number} id
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleMake = (id, data) =>
  request(`/vehicle-makes/${id}`, PUT, data);

/**
 * Delete a vehicle make.
 * @param {number} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteVehicleMake = (id) =>
  request(`/vehicle-makes/${id}`, DELETE);
