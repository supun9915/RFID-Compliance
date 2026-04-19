import { POST, request } from "./apiAdapter";

/**
 * Fetch ZPL print templates for one or more registration numbers.
 * @param {string[]} registrationNumbers
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getVehiclePrintTemplates = (registrationNumbers) =>
  request("/vehicle-prints/templates", POST, { registrationNumbers });

/**
 * Confirm that a vehicle label has been printed.
 * @param {string} vehicleNumber
 * @param {string} epc
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const confirmVehiclePrint = (vehicleNumber, epc) =>
  request("/vehicle-prints/confirm", POST, { vehicleNumber, epc });
