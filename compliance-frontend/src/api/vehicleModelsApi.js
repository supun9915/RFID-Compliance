import { GET, PATCH, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all vehicle models.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getVehicleModels = () => request("/vehicle-models", GET);

/**
 * Fetch all vehicle models for a specific make.
 * @param {number} makeId
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getVehicleModelsByMakeId = (makeId) =>
  request(`/vehicle-models/make/${makeId}`, GET);

/**
 * Fetch a vehicle model by ID.
 * @param {number} id
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const getVehicleModelById = (id) =>
  request(`/vehicle-models/${id}`, GET);

/**
 * Create a new vehicle model.
 * @param {{ name: string, makeId: number, description?: string }} data
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createVehicleModel = (data) =>
  request("/vehicle-models", POST, data);

/**
 * Update an existing vehicle model.
 * @param {number} id
 * @param {{ name: string, makeId: number, description?: string }} data
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleModel = (id, data) =>
  request(`/vehicle-models/${id}`, PUT, data);

/**
 * Delete a vehicle model.
 * @param {number} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteVehicleModel = (id) =>
  request(`/vehicle-models/${id}`, PATCH);

/**
 * Manage vehicle model active/inactive status.
 * @param {number} id
 * @param {boolean} active
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleModelStatus = (id, active) =>
  request(`/vehicle-models/${id}/status`, PATCH, undefined, { active });
