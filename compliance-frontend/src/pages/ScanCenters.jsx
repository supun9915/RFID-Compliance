import React, { useEffect, useState } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  createScanCenter,
  deleteScanCenter,
  getScanCenters,
  updateScanCenterStatus,
  updateScanCenter,
  getScanCenter,
  createReader,
  updateReader,
  deleteReader,
} from "../api/scanCentersApi";
import { X, Plus, Edit2, Cpu, Trash2 } from "lucide-react";
import { ApiResponsePopup } from "../components/Shared/ApiResponsePopup";
import { notifyResponse } from "../utils/responseNotifier";

export function ScanCenters() {
  const [scanCenters, setScanCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Readers management state
  const [showReadersModal, setShowReadersModal] = useState(false);
  const [readersCenter, setReadersCenter] = useState(null);
  const [readers, setReaders] = useState([]);
  const [readersLoading, setReadersLoading] = useState(false);
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [readerEditMode, setReaderEditMode] = useState(false);
  const [deleteReaderTarget, setDeleteReaderTarget] = useState(null);
  const [readerFormData, setReaderFormData] = useState({
    id: null,
    name: "",
    location: "",
    ipAddress: "",
    serialNumber: "",
    model: "",
    isActive: true,
  });

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    city: "",
    district: "",
    province: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchScanCenters();
  }, []);

  const fetchScanCenters = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getScanCenters();

      if (!result.success) {
        setError(result.message || "Failed to fetch scan centers");
        setScanCenters([]);
        return;
      }

      const normalized = (result.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        city: item.city,
        district: item.district,
        province: item.province,
        latitude: item.location?.latitude,
        longitude: item.location?.longitude,
        status: item.active ? "Active" : "Inactive",
        active: item.active,
      }));

      setScanCenters(normalized);
    } catch (err) {
      setError(err.message || "Error fetching scan centers");
      setScanCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Scan Center",
    },
    {
      key: "city",
      label: "City",
    },
    {
      key: "district",
      label: "District",
    },
    {
      key: "province",
      label: "Province",
    },
    {
      key: "latitude",
      label: "Latitude",
      render: (value) => (typeof value === "number" ? value.toFixed(4) : "-"),
    },
    {
      key: "longitude",
      label: "Longitude",
      render: (value) => (typeof value === "number" ? value.toFixed(4) : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      id: null,
      name: "",
      city: "",
      district: "",
      province: "",
      latitude: "",
      longitude: "",
    });
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      id: row.id,
      name: row.name || "",
      city: row.city || "",
      district: row.district || "",
      province: row.province || "",
      latitude:
        typeof row.latitude === "number" && !Number.isNaN(row.latitude)
          ? String(row.latitude)
          : "",
      longitude:
        typeof row.longitude === "number" && !Number.isNaN(row.longitude)
          ? String(row.longitude)
          : "",
    });
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const city = formData.city.trim();
    const district = formData.district.trim();
    const province = formData.province.trim();
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (!name || !city || !district || !province) {
      notifyResponse({
        type: "error",
        title: "Validation Error",
        message: "Please fill all required fields",
      });
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      notifyResponse({
        type: "error",
        title: "Validation Error",
        message: "Latitude and Longitude must be valid numbers",
      });
      return;
    }

    const payload = {
      name,
      city,
      district,
      province,
      location: {
        lat,
        lng,
      },
    };

    try {
      const result = editMode
        ? await updateScanCenter(formData.id, payload)
        : await createScanCenter(payload);

      if (result.success) {
        setShowModal(false);
        await fetchScanCenters();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to save scan center",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error saving scan center",
      });
    }
  };

  // ---- Readers management handlers ----

  const fetchReaders = async (scanCenterId) => {
    setReadersLoading(true);
    try {
      const result = await getScanCenter(scanCenterId);
      if (result.success) {
        setReaders(result.data?.readers || []);
      } else {
        notifyResponse({
          type: "error",
          title: "Error",
          message: result.message || "Failed to fetch readers",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error fetching readers",
      });
    } finally {
      setReadersLoading(false);
    }
  };

  const handleManageReaders = async (row) => {
    setReadersCenter({ id: row.id, name: row.name });
    setReaders([]);
    setShowReadersModal(true);
    await fetchReaders(row.id);
  };

  const handleAddReader = () => {
    setReaderEditMode(false);
    setReaderFormData({
      id: null,
      name: "",
      location: "",
      ipAddress: "",
      serialNumber: "",
      model: "",
      isActive: true,
    });
    setShowReaderForm(true);
  };

  const handleEditReader = (reader) => {
    setReaderEditMode(true);
    setReaderFormData({
      id: reader.id,
      name: reader.name || "",
      location: reader.location || "",
      ipAddress: reader.ipAddress || "",
      serialNumber: reader.serialNumber || "",
      model: reader.model || "",
      isActive: reader.isActive !== false,
    });
    setShowReaderForm(true);
  };

  const handleReaderFormChange = (field, value) => {
    setReaderFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReaderSubmit = async (e) => {
    e.preventDefault();

    const name = readerFormData.name.trim();
    if (!name) {
      notifyResponse({
        type: "error",
        title: "Validation Error",
        message: "Reader name is required",
      });
      return;
    }

    const payload = {
      name,
      location: readerFormData.location.trim() || undefined,
      ipAddress: readerFormData.ipAddress.trim() || undefined,
      serialNumber: readerFormData.serialNumber.trim() || undefined,
      model: readerFormData.model.trim() || undefined,
      isActive: readerFormData.isActive,
    };

    try {
      const result = readerEditMode
        ? await updateReader(readersCenter.id, readerFormData.id, payload)
        : await createReader(readersCenter.id, payload);

      if (result.success) {
        setShowReaderForm(false);
        await fetchReaders(readersCenter.id);
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to save reader",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error saving reader",
      });
    }
  };

  const handleDeleteReader = (reader) => {
    setDeleteReaderTarget(reader);
  };

  const handleConfirmDeleteReader = async () => {
    if (!deleteReaderTarget) return;
    const target = deleteReaderTarget;
    setDeleteReaderTarget(null);

    try {
      const result = await deleteReader(readersCenter.id, target.id);
      if (result.success) {
        await fetchReaders(readersCenter.id);
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to delete reader",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error deleting reader",
      });
    }
  };

  // ---- End readers management handlers ----

  const handleDelete = async (row) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      const result = await deleteScanCenter(target.id);

      if (result.success) {
        await fetchScanCenters();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to delete scan center",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error deleting scan center",
      });
    }
  };

  const handleToggleStatus = async (row) => {
    const nextActive = !row.active;
    const actionLabel = nextActive ? "activate" : "deactivate";

    try {
      const result = await updateScanCenterStatus(row.id, nextActive);

      if (result.success) {
        await fetchScanCenters();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: `Failed to ${actionLabel} scan center`,
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || `Error trying to ${actionLabel} scan center`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading scan centers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-red-600">{error}</div>
        <button
          onClick={fetchScanCenters}
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
        title="Scan Centers"
        columns={columns}
        data={scanCenters}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onManageReaders={handleManageReaders}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {editMode ? "Edit Scan Center" : "Add Scan Center"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter scan center name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="District"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Province"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="6.8402"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="79.9654"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                >
                  {editMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ApiResponsePopup
        open={Boolean(deleteTarget)}
        type="warning"
        title="Delete Scan Center"
        message={`Are you sure you want to delete "${deleteTarget?.name || ""}"?`}
        buttonLabel="Delete"
        cancelLabel="Cancel"
        showCancel
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Readers Management Modal */}
      {showReadersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-violet-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Readers</h3>
                  <p className="text-sm text-gray-500">{readersCenter?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddReader}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Reader
                </button>
                <button
                  onClick={() => setShowReadersModal(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1">
              {readersLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
                  Loading readers...
                </div>
              ) : readers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                  <Cpu className="w-8 h-8 opacity-30" />
                  <span className="text-sm">
                    No readers found for this scan center
                  </span>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Serial No.
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {readers.map((reader) => (
                      <tr
                        key={reader.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {reader.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {reader.location || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {reader.ipAddress || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {reader.serialNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {reader.model || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              reader.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}
                          >
                            {reader.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title="Edit Reader"
                              onClick={() => handleEditReader(reader)}
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              title="Delete Reader"
                              onClick={() => handleDeleteReader(reader)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reader Add / Edit Form Modal */}
      {showReaderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {readerEditMode ? "Edit Reader" : "Add Reader"}
              </h3>
              <button
                onClick={() => setShowReaderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReaderSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={readerFormData.name}
                    onChange={(e) =>
                      handleReaderFormChange("name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. Gate 1 Reader"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={readerFormData.location}
                    onChange={(e) =>
                      handleReaderFormChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. Gate 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={readerFormData.ipAddress}
                    onChange={(e) =>
                      handleReaderFormChange("ipAddress", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. 192.168.1.10"
                    maxLength={45}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={readerFormData.serialNumber}
                    onChange={(e) =>
                      handleReaderFormChange("serialNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. RFID-01-01"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={readerFormData.model}
                    onChange={(e) =>
                      handleReaderFormChange("model", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. Impinj R420"
                    maxLength={100}
                  />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleReaderFormChange(
                        "isActive",
                        !readerFormData.isActive,
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      readerFormData.isActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        readerFormData.isActive
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReaderForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                >
                  {readerEditMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
