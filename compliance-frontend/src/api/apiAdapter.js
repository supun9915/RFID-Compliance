import axios from "axios";

const GET = "get";
const POST = "post";
const PUT = "put";
const DELETE = "delete";
const PATCH = "patch";

/**
 * Clears authentication data from localStorage and redirects to login.
 */
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Core request function that handles all API calls.
 * Automatically attaches Bearer token if present in localStorage.
 * On 401/406 responses, clears auth state and redirects to login.
 */
const request = async (
  url,
  type,
  data = undefined,
  params = undefined,
  headers = { "Content-Type": "application/json" },
) => {
  const baseUrl = import.meta.env.VITE_API_ENDPOINT;
  const routePath = baseUrl + url;

  const token = localStorage.getItem("token");

  // Build timezone header
  let contextHeaders = {};
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    contextHeaders["Timezone"] = timezone;
  } catch (_) {
    // ignore
  }

  const instance = axios.create({
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...contextHeaders,
    },
  });

  const options = {
    method: type,
    url: routePath,
    data,
    params,
    headers: {
      ...instance.defaults.headers,
      ...headers,
    },
  };

  try {
    const result = await instance(options);

    // Handle 204 No Content
    if (result.status === 204) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        page: 0,
        size: 20,
        first: true,
        last: true,
      };
    }

    return result.data;
  } catch (error) {
    console.error("API Request failed:", error?.message);

    if (error.response) {
      const status = error.response.status;

      if (
        status === 401 ||
        (status === 406 &&
          error.response.data?.message === "No message available")
      ) {
        clearAuthData();
        window.location.href = "/login";
        return 0;
      }

      return { error };
    }

    if (error.request) {
      return {
        error: {
          ...error,
          message: `Network error: Unable to connect to ${baseUrl}. Please check if the server is running.`,
          code: "NETWORK_ERROR",
        },
      };
    }

    return { error };
  }
};

export { GET, POST, PUT, PATCH, DELETE, request, clearAuthData };
