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

/**
 * Fetch a single scan center by ID (includes its readers).
 * @param {number} id
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const getScanCenter = async (id) => {
  const response = await request(`/scan-centers/${id}`, GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch scan center";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Create a reader for a specific scan center.
 * POST /readers/scan-center/{scanCenterId}
 * @param {number} scanCenterId
 * @param {{ name: string, location?: string, ipAddress?: string, serialNumber?: string, model?: string, isActive?: boolean }} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const createReader = async (scanCenterId, payload) => {
  const response = await request(
    `/readers/scan-center/${scanCenterId}`,
    POST,
    payload,
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to create reader";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update a reader belonging to a specific scan center.
 * PUT /readers/scan-center/{scanCenterId}/{readerId}
 * @param {number} scanCenterId
 * @param {number} readerId
 * @param {{ name: string, location?: string, ipAddress?: string, serialNumber?: string, model?: string, isActive?: boolean }} payload
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const updateReader = async (scanCenterId, readerId, payload) => {
  const response = await request(
    `/readers/scan-center/${scanCenterId}/${readerId}`,
    PUT,
    payload,
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update reader";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Delete a reader belonging to a specific scan center.
 * DELETE /readers/scan-center/{scanCenterId}/{readerId}
 * @param {number} scanCenterId
 * @param {number} readerId
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const deleteReader = async (scanCenterId, readerId) => {
  const response = await request(
    `/readers/scan-center/${scanCenterId}/${readerId}`,
    DELETE,
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to delete reader";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    message: response.message,
  };
};
