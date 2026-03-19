import { GET, request } from "./apiAdapter";

/**
 * Fetch detection history with optional filters.
 * @param {{ scanCenterId?: number|null, status?: string|null, readerId?: number|null }} params
 * @returns {Promise<{ success: boolean, data?: array, message?: string }>}
 */
export const getDetections = async ({
  scanCenterId,
  status,
  readerId,
} = {}) => {
  const queryParams = {};
  if (scanCenterId) queryParams.scanCenterId = scanCenterId;
  if (status) queryParams.status = status;
  if (readerId) queryParams.readerId = readerId;

  const response = await request("/detections", GET, undefined, queryParams);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch detection history";
    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: response.data || [],
    message: response.message,
  };
};
