import React, { useState, useEffect } from "react";
import { DataTable } from "../../components/Shared/DataTable";
import { OwnerFormModal } from "./model/OwnerFormModal";
import {
  createUser,
  updateUser,
  getUsersByRole,
  getRoles,
} from "../../api/usersApi";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  nic: "",
};

export function Owners({ onViewVehicles }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [ownerRoleId, setOwnerRoleId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [initialValues, setInitialValues] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    const response = await getUsersByRole("OWNER");
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
    getRoles().then((res) => {
      if (res.success) {
        const ownerRole = res.data.find((r) => r.name === "OWNER");
        if (ownerRole) setOwnerRoleId(ownerRole.id);
      }
    });
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setInitialValues(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setInitialValues({
      username: user.username || "",
      email: user.email || "",
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      contactNumber: user.contactNumber || "",
      nic: user.nic || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);

    let response;
    if (editingUser) {
      const payload = {
        ...values,
        id: editingUser.id,
        roleId: Number(ownerRoleId),
      };
      if (!payload.password) delete payload.password;
      response = await updateUser(payload);
    } else {
      response = await createUser({ ...values, roleId: Number(ownerRoleId) });
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
          onVehicleDetails={(row) => onViewVehicles(row)}
          showDeleteAction={false}
          showToggleAction={false}
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <OwnerFormModal
          editingUser={editingUser}
          initialValues={initialValues}
          submitting={submitting}
          formError={formError}
          closeModal={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
