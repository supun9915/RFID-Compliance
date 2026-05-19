import { GET, PATCH, POST, PUT, request } from "./apiAdapter";

/**
 * Fetch all users.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getUsers = async () => {
  const response = await request("/users", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch users";

    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
};

/**
 * Fetch currently authenticated user profile.
 * @returns {Promise<{ success: boolean, data?: object, message: string }>}
 */
export const getCurrentUser = async () => {
  const response = await request("/users/me", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch current user";
    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Create a new user.
 * @param {{ username, email, password, firstName, lastName, contactNumber, nic, district, province, roleId, scanCenterId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const createUser = async (userData) => {
  const response = await request("/users", POST, userData);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to create user";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update an existing user.
 * @param {{ id, username, email, password, firstName, lastName, contactNumber, nic, district, province, roleId, scanCenterId }} userData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateUser = async (userData) => {
  const { id, ...payload } = userData;
  const response = await request(`/users/${id}`, PUT, payload);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update user";

    return { success: false, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Delete a user.
 * @param {string} userId
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const deleteUser = (userId) => request(`/users/${userId}`, PATCH);

/**
 * Soft delete a user.
 * @param {string|number} userId
 * @returns {Promise<{ success: boolean, data?: object, message: string }>}
 */
export const softDeleteUser = (userId) => request(`/users/${userId}`, PATCH);

/**
 * Manage user active/inactive status.
 * @param {string|number} userId
 * @param {boolean} active
 * @returns {Promise<{ success: boolean, data?: object, message: string }>}
 */
export const updateUserStatus = (userId, active) =>
  request(`/users/${userId}/status`, PATCH, undefined, { active });

/**
 * Fetch a single user (owner) by ID, including their vehicleDocumentResponseList.
 * @param {number|string} userId
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const getUserById = async (userId) => {
  const response = await request(`/users/${userId}`, GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch user";
    return { success: false, data: null, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Add a vehicle (with documents) to an owner.
 * @param {number|string} ownerId
 * @param {{ vehicleTypeId, vehicleModelId, registrationNumber, vehicleNumber, chassisNumber, registeredYear, documentRequests }} vehicleData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const addVehicleToOwner = async (ownerId, vehicleData) => {
  const response = await request(`/users/owner/${ownerId}`, POST, vehicleData);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to add vehicle";
    return { success: false, data: null, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Update an existing vehicle (with documents) for an owner.
 * @param {number|string} vehicleId
 * @param {{ vehicleTypeId, vehicleModelId, registrationNumber, vehicleNumber, chassisNumber, registeredYear, documentRequests }} vehicleData
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const updateVehicleForOwner = async (vehicleId, vehicleData) => {
  const response = await request(`/users/owner/${vehicleId}`, PUT, vehicleData);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to update vehicle";
    return { success: false, data: null, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Remove a vehicle from an owner.
 * @param {number|string} userId
 * @param {number|string} vehicleId
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 */
export const removeVehicleFromOwner = async (userId, vehicleId) => {
  const response = await request(
    `/users/${userId}/vehicles/${vehicleId}/remove`,
    PATCH,
  );

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to remove vehicle";
    return { success: false, data: null, message };
  }

  return {
    success: response.success !== false,
    data: response.data,
    message: response.message,
  };
};

/**
 * Get users by role.
 * @param {string} roleName - The name of the role (e.g., "admin", "owner", "entrance")
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 * Note: This endpoint is assumed to exist on the backend. Adjust the URL as needed.
 */
export const getUsersByRole = (roleName) =>
  request("/users", GET, undefined, { role: roleName });

/**
 * Fetch all roles.
 * @returns {Promise<{ success: boolean, data: Array, message: string }>}
 */
export const getRoles = async () => {
  const response = await request("/roles", GET);

  if (!response || response.error) {
    const message =
      response?.error?.response?.data?.message ||
      response?.error?.message ||
      "Failed to fetch roles";
    return { success: false, data: [], message };
  }

  return {
    success: response.success !== false,
    data: Array.isArray(response.data) ? response.data : [],
    message: response.message,
  };
};
