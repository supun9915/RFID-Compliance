import { GET, PATCH, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all scan centers.
 * @returns {Promise<{ success: boolean, data: Array, message?: string }>}
 */
export const getScanCenters = async () => {
  const response = await request("/scan-centers", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch scan centers";

    return { success: false, data: [], message };
  }

  const data = Array.isArray(response.data) ? response.data : [];

  return {
    success: response.success !== false,
    data,
    message: response.message,
  };
};

/**
 * Create a new scan center.
 * @param {{ name: string, city: string, district: string, province: string, location: { lat: number, lng: number } }} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const createScanCenter = async (payload) => {
  const response = await request("/scan-centers", POST, payload);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to create scan center";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update an existing scan center.
 * @param {number} id
 * @param {{ name: string, city: string, district: string, province: string, location: { lat: number, lng: number } }} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const updateScanCenter = async (id, payload) => {
  const response = await request(`/scan-centers/${id}`, PUT, payload);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update scan center";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Delete an existing scan center.
 * @param {number} id
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const deleteScanCenter = async (id) => {
  const response = await request(`/scan-centers/${id}`, PATCH);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to delete scan center";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    message: response.message,
  };
};

/**
 * Manage scan center active/inactive status.
 * @param {number} id
 * @param {boolean} active
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const updateScanCenterStatus = async (id, active) => {
  const response = await request(
    `/scan-centers/${id}/status`,
    PATCH,
    undefined,
    { active },
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update scan center status";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};
