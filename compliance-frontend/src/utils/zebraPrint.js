const BROWSER_PRINT_URL = "http://localhost:9100";

const STORAGE_KEY = "zebra_selected_printer";
const URL_STORAGE_KEY = "zebra_browser_print_url";

/**
 * Get the configured Browser Print service URL (default: http://localhost:9100).
 */
export const getBrowserPrintUrl = () =>
  localStorage.getItem(URL_STORAGE_KEY) || BROWSER_PRINT_URL;

/**
 * Save a custom Browser Print service URL.
 * @param {string} url
 */
export const saveBrowserPrintUrl = (url) =>
  localStorage.setItem(URL_STORAGE_KEY, url);

/**
 * Fetch the list of available Zebra printers from the local Browser Print service.
 * @returns {Promise<{ success: boolean, printers: Array, error?: string }>}
 */
export const getAvailablePrinters = async () => {
  try {
    const baseUrl = getBrowserPrintUrl();
    const response = await fetch(`${baseUrl}/available`, {
      method: "GET",
    });
    if (!response.ok) {
      return {
        success: false,
        printers: [],
        error: "Service returned an error.",
      };
    }
    const data = await response.json();
    return { success: true, printers: data.printer || [] };
  } catch (error) {
    return {
      success: false,
      printers: [],
      error:
        "Cannot connect to Zebra Browser Print. Make sure the application is installed and running.",
    };
  }
};

/**
 * Send ZPL code to the given printer device.
 * @param {object} device  - Printer device object from getAvailablePrinters
 * @param {string} zplCode - ZPL label code
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const printZpl = async (device, zplCode) => {
  try {
    const baseUrl = getBrowserPrintUrl();
    const response = await fetch(`${baseUrl}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, data: zplCode }),
    });
    if (response.ok) {
      return { success: true };
    }
    const text = await response.text();
    return { success: false, error: text || "Print request failed." };
  } catch (error) {
    return {
      success: false,
      error: "Failed to send to printer. Check Browser Print connection.",
    };
  }
};

/**
 * Retrieve the saved default printer from localStorage.
 * @returns {object|null}
 */
export const getSelectedPrinter = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save the selected printer to localStorage.
 * @param {object} printer
 */
export const saveSelectedPrinter = (printer) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(printer));
};

/**
 * Clear the saved default printer.
 */
export const clearSelectedPrinter = () => {
  localStorage.removeItem(STORAGE_KEY);
};
