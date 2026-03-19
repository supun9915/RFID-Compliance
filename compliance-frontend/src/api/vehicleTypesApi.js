import { GET, PATCH, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all vehicle types.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getVehicleTypes = () => request("/vehicle-types", GET);

/**
 * Create a new vehicle type.
 * @param {{ name: string }} vehicleTypeData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createVehicleType = (vehicleTypeData) =>
  request("/vehicle-types", POST, vehicleTypeData);

/**
 * Update an existing vehicle type.
 * @param {number} id - Vehicle type ID
 * @param {{ name: string }} vehicleTypeData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleType = (id, vehicleTypeData) =>
  request(`/vehicle-types/${id}`, PUT, vehicleTypeData);

/**
 * Delete a vehicle type.
 * @param {number} id - Vehicle type ID
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteVehicleType = (id) => request(`/vehicle-types/${id}`, PATCH);

/**
 * Manage vehicle type active/inactive status.
 * @param {number} id - Vehicle type ID
 * @param {boolean} active
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleTypeStatus = (id, active) =>
  request(`/vehicle-types/${id}/status`, PATCH, undefined, { active });
