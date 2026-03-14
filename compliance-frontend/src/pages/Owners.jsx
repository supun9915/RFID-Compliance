import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DataTable } from "../components/Shared/DataTable";
import { getUsers, createUser, updateUser } from "../api/usersApi";

const ROLE_OPTIONS = [
  { id: 1, name: "SUPERADMIN" },
  { id: 2, name: "ADMIN" },
  { id: 3, name: "OWNER" },
  { id: 4, name: "POLICE" },
];

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  nic: "",
  roleId: 3,
};

export function Owners() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    const response = await getUsers();
    if (
      response &&
      !response.error &&
      response.success &&
      Array.isArray(response.data)
    ) {
      const owners = response.data.filter((u) => u.role?.name === "OWNER");
      setUsers(owners);
    } else {
      const msg =
        response?.error?.response?.data?.message ||
        response?.error?.message ||
        "Failed to load users.";
      setFetchError(msg);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
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
      roleId: user.role?.id || 3,
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

    let response;
    if (editingUser) {
      const payload = {
        ...form,
        id: editingUser.id,
        roleId: Number(form.roleId),
      };
      if (!payload.password) delete payload.password;
      response = await updateUser(payload);
    } else {
      response = await createUser({ ...form, roleId: Number(form.roleId) });
    }

    if (response && !response.error && response.success) {
      closeModal();
      fetchUsers();
    } else {
      const msg =
        response?.error?.response?.data?.message ||
        response?.message ||
        response?.error?.message ||
        "Operation failed. Please try again.";
      setFormError(msg);
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "fullName", label: "Full Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact" },
    { key: "nic", label: "NIC" },
    {
      key: "roleName",
      label: "Role",
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {value}
        </span>
      ),
    },
    { key: "createdAt", label: "Created At" },
  ];

  const tableData = users.map((u) => ({
    ...u,
    fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
    roleName: u.role?.name || "-",
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleString() : "-",
  }));

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
          Loading owners...
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">
          {fetchError}
        </div>
      ) : (
        <DataTable
          title="Vehicle Owners"
          columns={columns}
          data={tableData}
          onAdd={openCreateModal}
          onEdit={openEditModal}
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800">
                {editingUser ? "Edit User" : "Create User"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* First / Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
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
                    placeholder="Doe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="johndoe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {/* Email */}
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
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {/* Password */}
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
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {/* Contact / NIC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Contact Number
                  </label>
                  <input
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="0771234567"
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
                    placeholder="199012345678"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Footer Buttons */}
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
