import { GET, PATCH, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all document types
 * @returns {Promise<{ success: boolean, data?: array, message?: string }>}
 */
export const getDocumentTypes = async () => {
  const response = await request("/document-types", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch document types";
    return { success: false, message };
  }

  // API shape: { success, message, data: [...], timestamp }
  return {
    success: response.success !== false,
    data: response.data || [],
    message: response.message,
  };
};

/**
 * Create a new document type
 * @param {object} documentType - { name, description?, zplCode? }
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const createDocumentType = async (documentType) => {
  const response = await request("/document-types", POST, documentType);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to create document type";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update a document type
 * @param {number} id - Document type ID
 * @param {object} documentType - { name, description?, zplCode? }
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const updateDocumentType = async (id, documentType) => {
  const response = await request(`/document-types/${id}`, PUT, documentType);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update document type";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Soft delete a document type.
 * @param {number} id - Document type ID
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const deleteDocumentType = async (id) => {
  const response = await request(`/document-types/${id}`, PATCH);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to delete document type";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Manage document type active/inactive status.
 * @param {number} id - Document type ID
 * @param {boolean} active - true to activate, false to deactivate
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const updateDocumentTypeStatus = async (id, active) => {
  const response = await request(
    `/document-types/${id}/status`,
    PATCH,
    undefined,
    { active },
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update document type status";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};
