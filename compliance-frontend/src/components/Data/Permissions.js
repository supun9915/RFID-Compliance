/**
 * Role-Based Access Control (RBAC) Permissions
 *
 * Roles:
 *   SUPER_ADMIN       - Full access to everything
 *   SYSTEM_ADMIN      - Full access to everything
 *   ADMIN             - Broad access, no Vehicle page
 *   OWNER             - Account + Vehicle pages only
 *   SCAN_CENTER_ADMIN - Operational pages + Account
 *   SCAN_CENTER_USER  - Read-only operational pages + Account
 *
 * Each page entry defines:
 *   view   {string[]} - roles allowed to VIEW the page
 *   manage {string[]} - roles allowed to MANAGE (create/edit/delete) on the page
 *
 * For pages with no view/manage split (e.g. Dashboard),
 * both view and manage use the same role set.
 */

export const ROLES = {
  SUPER_ADMIN: "SUPERADMIN",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  SCAN_CENTER_ADMIN: "SCAN_CENTER_ADMIN",
  SCAN_CENTER_USER: "SCAN_CENTER_USER",
};

export const PAGES = {
  DASHBOARD: "Dashboard",
  DOCUMENT_TYPE: "Document Type",
  SCAN_CENTER: "Scan Center",
  DETECTION_HISTORY: "Detection History",
  OWNERS: "Owners",
  ADMIN_USERS: "Admin Users",
  VEHICLE_TYPES: "Vehicle Types",
  VEHICLE_MAKES: "Vehicle Makes",
  VEHICLE_MODELS: "Vehicle Models",
  ACCOUNT: "Account",
  VEHICLE: "Vehicle",
};

export const permissions = {
  [PAGES.DASHBOARD]: {
    view: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
    manage: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
  },

  [PAGES.DOCUMENT_TYPE]: {
    view: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.SCAN_CENTER_USER],
  },

  [PAGES.SCAN_CENTER]: {
    view: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.SCAN_CENTER_ADMIN],
  },

  [PAGES.DETECTION_HISTORY]: {
    view: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.SCAN_CENTER_ADMIN],
  },

  [PAGES.OWNERS]: {
    view: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
  },

  [PAGES.ADMIN_USERS]: {
    view: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
  },

  [PAGES.VEHICLE_TYPES]: {
    view: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
  },

  [PAGES.VEHICLE_MAKES]: {
    view: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
  },

  [PAGES.VEHICLE_MODELS]: {
    view: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
    manage: [ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ADMIN],
  },

  [PAGES.ACCOUNT]: {
    view: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.OWNER,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
    manage: [
      ROLES.SUPER_ADMIN,
      ROLES.SYSTEM_ADMIN,
      ROLES.ADMIN,
      ROLES.OWNER,
      ROLES.SCAN_CENTER_ADMIN,
      ROLES.SCAN_CENTER_USER,
    ],
  },

  [PAGES.VEHICLE]: {
    view: [ROLES.OWNER],
    manage: [ROLES.OWNER],
  },
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/**
 * Check if a role can VIEW a page.
 * @param {string} role   - One of the ROLES values
 * @param {string} page   - One of the PAGES values
 * @returns {boolean}
 */
export function canView(role, page) {
  return permissions[page]?.view.includes(role) ?? false;
}

/**
 * Check if a role can MANAGE (create / edit / delete) on a page.
 * @param {string} role   - One of the ROLES values
 * @param {string} page   - One of the PAGES values
 * @returns {boolean}
 */
export function canManage(role, page) {
  return permissions[page]?.manage.includes(role) ?? false;
}

/**
 * Get all pages a role is allowed to view.
 * @param {string} role - One of the ROLES values
 * @returns {string[]}  - Array of page keys the role can view
 */
export function getAllowedPages(role) {
  return Object.keys(permissions).filter((page) =>
    permissions[page].view.includes(role),
  );
}

/**
 * Read the current user's role from localStorage.
 * @returns {string} - Role name matching one of the ROLES values, or ""
 */
export function getUserRole() {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return "";
    const user = JSON.parse(stored);
    const rawRole = user.role || user.userRole || "";
    return typeof rawRole === "object" && rawRole !== null
      ? rawRole.name || rawRole.roleName || ""
      : rawRole;
  } catch (_) {
    return "";
  }
}
