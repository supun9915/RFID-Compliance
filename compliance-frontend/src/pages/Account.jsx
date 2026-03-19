import React, { useState } from "react";
import { User, Phone, Lock, Save, AlertCircle } from "lucide-react";
import { updateUser } from "../api/usersApi";

export function Account() {
  let storedUser = {};
  try {
    const stored = localStorage.getItem("user");
    if (stored) storedUser = JSON.parse(stored);
  } catch (_) {}

  const rawRole = storedUser.role || storedUser.userRole || "";
  const roleName =
    typeof rawRole === "object" && rawRole !== null
      ? rawRole.roleName || rawRole.name || ""
      : rawRole;
  const roleId =
    typeof rawRole === "object" && rawRole !== null
      ? (rawRole.id ?? storedUser.roleId)
      : storedUser.roleId;

  const [contactNumber, setContactNumber] = useState(
    storedUser.contactNumber || "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSave = async () => {
    setFormError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }

    setSaving(true);

    const payload = {
      id: storedUser.id,
      username: storedUser.username,
      email: storedUser.email,
      firstName: storedUser.firstName,
      lastName: storedUser.lastName,
      contactNumber,
      nic: storedUser.nic,
      district: storedUser.district,
      province: storedUser.province,
      roleId,
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    const result = await updateUser(payload);
    setSaving(false);

    if (result.success) {
      const updatedUser = { ...storedUser, contactNumber };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setFormError(result.message || "Failed to update profile.");
    }
  };

  const ReadOnlyField = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value || "—"}
        readOnly
        disabled
        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
      />
    </div>
  );

  const fullName =
    [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" ") ||
    storedUser.username ||
    "User";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            View your profile and update your contact number or password.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Error banner */}
      {formError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold uppercase">
                {fullName.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">
              {roleName || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {storedUser.email || "—"}
            </p>

            <div className="mt-5 w-full border-t border-gray-100 pt-4 space-y-2 text-left">
              {[
                {
                  label: "User ID",
                  value: storedUser.id ? `#${storedUser.id}` : "—",
                },
                { label: "Username", value: storedUser.username || "—" },
                { label: "NIC", value: storedUser.nic || "—" },
                { label: "District", value: storedUser.district || "—" },
                { label: "Province", value: storedUser.province || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="First Name" value={storedUser.firstName} />
              <ReadOnlyField label="Last Name" value={storedUser.lastName} />
              <ReadOnlyField label="Username" value={storedUser.username} />
              <ReadOnlyField label="Email" value={storedUser.email} />
              <ReadOnlyField label="NIC" value={storedUser.nic} />
              <ReadOnlyField label="District" value={storedUser.district} />
              <ReadOnlyField label="Province" value={storedUser.province} />
              <ReadOnlyField label="Role" value={roleName} />
            </div>

            {/* Editable: Contact Number */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
                <span className="ml-2 text-xs font-normal text-blue-600">
                  (editable)
                </span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Change Password
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Leave both fields blank to keep your current password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
