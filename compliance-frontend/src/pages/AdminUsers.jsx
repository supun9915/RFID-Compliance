import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { DataTable } from "../components/Shared/DataTable";
import { createUser, getUsersByRole, updateUser } from "../api/usersApi";
import { getScanCenters } from "../api/scanCentersApi";

const ADMIN_ROLE_NAMES = [
  "SYSTEM_ADMIN",
  "ADMIN",
  "OWNER",
  "SCAN_CENTER_ADMIN",
  "SCAN_CENTER_USER",
];

const MODAL_ROLE_NAMES = [
  "SYSTEM_ADMIN",
  "ADMIN",
  "SCAN_CENTER_ADMIN",
  "SCAN_CENTER_USER",
];

const ROLE_FALLBACK_IDS = {
  SYSTEM_ADMIN: 1,
  ADMIN: 2,
  OWNER: 3,
  SCAN_CENTER_ADMIN: 5,
  SCAN_CENTER_USER: 6,
};

const SCAN_CENTER_REQUIRED_ROLES = new Set([
  "SCAN_CENTER_ADMIN",
  "SCAN_CENTER_USER",
]);

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  nic: "",
  district: "",
  province: "",
  roleId: "",
  scanCenterId: "",
};

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [scanCenters, setScanCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersResponse, scanCentersResponse] = await Promise.all([
        getUsersByRole(ADMIN_ROLE_NAMES.join(", ")),
        getScanCenters(),
      ]);

      if (
        !usersResponse ||
        usersResponse.error ||
        usersResponse.success === false
      ) {
        const message =
          usersResponse?.error?.response?.data?.message ||
          usersResponse?.error?.message ||
          usersResponse?.message ||
          "Failed to load admin users";

        setError(message);
        setUsers([]);
      } else {
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      }

      if (!scanCentersResponse.success) {
        setScanCenters([]);
      } else {
        setScanCenters(
          (scanCentersResponse.data || []).map((item) => ({
            id: item.id,
            name: item.name,
          })),
        );
      }
    } catch (err) {
      setError(err?.message || "Failed to load admin users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roleOptions = useMemo(() => {
    const deduped = new Map();

    users.forEach((user) => {
      const id = user.role?.id;
      const name = user.role?.name;
      if (id && name && MODAL_ROLE_NAMES.includes(name)) {
        deduped.set(name, { id, name });
      }
    });

    MODAL_ROLE_NAMES.forEach((name) => {
      if (!deduped.has(name)) {
        deduped.set(name, {
          id: ROLE_FALLBACK_IDS[name],
          name,
        });
      }
    });

    return Array.from(deduped.values());
  }, [users]);

  const selectedRoleName = useMemo(() => {
    const selectedRole = roleOptions.find(
      (role) => String(role.id) === String(form.roleId),
    );
    return selectedRole?.name;
  }, [form.roleId, roleOptions]);

  const requiresScanCenter = SCAN_CENTER_REQUIRED_ROLES.has(selectedRoleName);

  const columns = [
    { key: "id", label: "ID" },
    { key: "fullName", label: "Full Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "roleName",
      label: "Role",
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "scanCenterName",
      label: "Scan Center",
      render: (value) => value || "Unassigned",
    },
    { key: "contactNumber", label: "Contact" },
    { key: "district", label: "District" },
    { key: "province", label: "Province" },
    {
      key: "createdAt",
      label: "Created At",
      render: (value) => (value ? new Date(value).toLocaleString() : "-"),
    },
  ];

  const tableData = users.map((user) => ({
    ...user,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    roleName: user.role?.name || "-",
    scanCenterName: user.scanCenterName || null,
  }));

  const openCreateModal = () => {
    const defaultRoleId = roleOptions[0]?.id ? String(roleOptions[0].id) : "";
    setEditingUser(null);
    setForm({ ...EMPTY_FORM, roleId: defaultRoleId });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      contactNumber: user.contactNumber || "",
      nic: user.nic || "",
      district: user.district || "",
      province: user.province || "",
      roleId: user.role?.id ? String(user.role.id) : "",
      scanCenterId: user.scanCenterId ? String(user.scanCenterId) : "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const roleId = Number(form.roleId);
    const scanCenterId = form.scanCenterId ? Number(form.scanCenterId) : null;

    if (!roleId) {
      setFormError("Please select a valid role.");
      setSubmitting(false);
      return;
    }

    if (requiresScanCenter && !scanCenterId) {
      setFormError("Selected role requires a scan center.");
      setSubmitting(false);
      return;
    }

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      contactNumber: form.contactNumber.trim(),
      nic: form.nic.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      roleId,
      scanCenterId: requiresScanCenter ? scanCenterId : null,
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    if (!editingUser && !payload.password) {
      setFormError("Password is required when creating a user.");
      setSubmitting(false);
      return;
    }

    let response;
    if (editingUser) {
      response = await updateUser({ ...payload, id: editingUser.id });
    } else {
      response = await createUser(payload);
    }

    if (response && !response.error && response.success) {
      closeModal();
      await fetchData();
    } else {
      const message =
        response?.error?.response?.data?.message ||
        response?.message ||
        response?.error?.message ||
        "Operation failed. Please try again.";
      setFormError(message);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Loading admin users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        title="System Users"
        columns={columns}
        data={tableData}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        showDeleteAction={false}
        showToggleAction={false}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800">
                {editingUser ? "Edit Admin User" : "Create Admin User"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Password{" "}
                    {editingUser ? (
                      <span className="text-gray-400 font-normal">
                        (leave blank to keep unchanged)
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Contact Number
                  </label>
                  <input
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    NIC
                  </label>
                  <input
                    name="nic"
                    value={form.nic}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    District
                  </label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Province
                  </label>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    value={form.roleId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Scan Center
                    {requiresScanCenter && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <select
                    name="scanCenterId"
                    value={form.scanCenterId}
                    onChange={handleChange}
                    required={requiresScanCenter}
                    disabled={!requiresScanCenter}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="">No scan center</option>
                    {scanCenters.map((scanCenter) => (
                      <option key={scanCenter.id} value={scanCenter.id}>
                        {scanCenter.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Saving..." : editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
