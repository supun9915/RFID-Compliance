import React, { useEffect, useState } from "react";
import { User, Phone, Lock, Save, AlertCircle } from "lucide-react";
import { getCurrentUser, updateUser } from "../api/usersApi";

export function Account() {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch (_) {
      return {};
    }
  });
  const [contactNumber, setContactNumber] = useState(
    profile.contactNumber || "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      const result = await getCurrentUser();

      if (!isMounted) return;

      if (result.success && result.data) {
        setProfile(result.data);
        setContactNumber(result.data.contactNumber || "");
        localStorage.setItem("user", JSON.stringify(result.data));
      } else {
        setProfileError(result.message || "Failed to load profile details.");
      }

      setLoadingProfile(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const rawRole = profile.role || profile.userRole || "";
  const roleName =
    typeof rawRole === "object" && rawRole !== null
      ? rawRole.roleName || rawRole.name || ""
      : rawRole;
  const roleId =
    typeof rawRole === "object" && rawRole !== null
      ? (rawRole.id ?? profile.roleId)
      : profile.roleId;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString();
  };

  const handleSave = async () => {
    setFormError(null);

    if (!profile.id) {
      setFormError("User profile is not loaded yet. Please try again.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }

    setSaving(true);

    const payload = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      contactNumber,
      nic: profile.nic,
      district: profile.district,
      province: profile.province,
      roleId,
      scanCenterId: profile.scanCenter?.id ?? null,
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    const result = await updateUser(payload);
    setSaving(false);

    if (result.success) {
      const updatedUser = result.data || { ...profile, contactNumber };
      setProfile(updatedUser);
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
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.username ||
    "User";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Profile details are loaded from the authenticated users/me endpoint.
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
      {(profileError || formError) && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {profileError || formError}
        </div>
      )}

      {loadingProfile && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-500">
          Loading account details...
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
            <p className="text-xs text-gray-400 mt-1">{profile.email || "—"}</p>

            <div className="mt-5 w-full border-t border-gray-100 pt-4 space-y-2 text-left">
              {[
                {
                  label: "User ID",
                  value: profile.id ? `#${profile.id}` : "—",
                },
                { label: "Username", value: profile.username || "—" },
                { label: "NIC", value: profile.nic || "—" },
                { label: "District", value: profile.district || "—" },
                { label: "Province", value: profile.province || "—" },
                {
                  label: "Active",
                  value:
                    typeof profile.active === "boolean"
                      ? profile.active
                        ? "Yes"
                        : "No"
                      : "—",
                },
                {
                  label: "Deleted",
                  value:
                    typeof profile.deleted === "boolean"
                      ? profile.deleted
                        ? "Yes"
                        : "No"
                      : "—",
                },
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
              <ReadOnlyField label="First Name" value={profile.firstName} />
              <ReadOnlyField label="Last Name" value={profile.lastName} />
              <ReadOnlyField label="Username" value={profile.username} />
              <ReadOnlyField label="Email" value={profile.email} />
              <ReadOnlyField label="NIC" value={profile.nic} />
              <ReadOnlyField label="District" value={profile.district} />
              <ReadOnlyField label="Province" value={profile.province} />
              <ReadOnlyField label="Role" value={roleName} />
              <ReadOnlyField
                label="Created At"
                value={formatDate(profile.createdAt)}
              />
              <ReadOnlyField
                label="Updated At"
                value={formatDate(profile.updatedAt)}
              />
              <ReadOnlyField
                label="User Active"
                value={
                  typeof profile.active === "boolean"
                    ? profile.active
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
              <ReadOnlyField
                label="User Deleted"
                value={
                  typeof profile.deleted === "boolean"
                    ? profile.deleted
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
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

          {/* Role Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Role Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Role ID" value={profile.role?.id} />
              <ReadOnlyField label="Role Name" value={profile.role?.name} />
              <ReadOnlyField
                label="Role Description"
                value={profile.role?.description}
              />
              <ReadOnlyField
                label="Role Active"
                value={
                  typeof profile.role?.active === "boolean"
                    ? profile.role.active
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
              <ReadOnlyField
                label="Role Deleted"
                value={
                  typeof profile.role?.deleted === "boolean"
                    ? profile.role.deleted
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
              <ReadOnlyField
                label="Role Created At"
                value={formatDate(profile.role?.createdAt)}
              />
              <ReadOnlyField
                label="Role Updated At"
                value={formatDate(profile.role?.updatedAt)}
              />
            </div>
          </div>

          {/* Scan Center Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Scan Center Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Center ID" value={profile.scanCenter?.id} />
              <ReadOnlyField
                label="Center Name"
                value={profile.scanCenter?.name}
              />
              <ReadOnlyField
                label="Center Location"
                value={profile.scanCenter?.location}
              />
              <ReadOnlyField
                label="Center City"
                value={profile.scanCenter?.city}
              />
              <ReadOnlyField
                label="Center District"
                value={profile.scanCenter?.district}
              />
              <ReadOnlyField
                label="Center Province"
                value={profile.scanCenter?.province}
              />
              <ReadOnlyField
                label="Center Active"
                value={
                  typeof profile.scanCenter?.isActive === "boolean"
                    ? profile.scanCenter.isActive
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
              <ReadOnlyField
                label="Center Deleted"
                value={
                  typeof profile.scanCenter?.deleted === "boolean"
                    ? profile.scanCenter.deleted
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />
              <ReadOnlyField
                label="Center Created At"
                value={formatDate(profile.scanCenter?.createdAt)}
              />
              <ReadOnlyField
                label="Center Updated At"
                value={formatDate(profile.scanCenter?.updatedAt)}
              />
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
