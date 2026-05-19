import { GET, request } from "./apiAdapter";

/**
 * Search owners/vehicles by vehicle number, registration number, owner name, or NIC.
 * @param {string} query - Search term
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const searchVehicles = async (query) => {
  const response = await request("/vehicles/search", GET, undefined, {
    q: query,
  });

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to search vehicles";
    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
};
