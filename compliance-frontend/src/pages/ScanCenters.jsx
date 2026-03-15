import React, { useEffect, useState } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  createScanCenter,
  deleteScanCenter,
  getScanCenters,
  updateScanCenter,
} from "../api/scanCentersApi";
import { X } from "lucide-react";

export function ScanCenters() {
  const [scanCenters, setScanCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
        status: item.isActive ? "Active" : "Inactive",
        active: item.isActive,
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
            value === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {value}
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
      alert("Please fill all required fields");
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Latitude and Longitude must be valid numbers");
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
        alert(
          editMode
            ? "Scan center updated successfully"
            : "Scan center created successfully",
        );
        setShowModal(false);
        await fetchScanCenters();
      } else {
        alert(result.message || "Failed to save scan center");
      }
    } catch (err) {
      alert(err.message || "Error saving scan center");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      return;
    }

    try {
      const result = await deleteScanCenter(row.id);

      if (result.success) {
        alert("Scan center deleted successfully");
        await fetchScanCenters();
      } else {
        alert(result.message || "Failed to delete scan center");
      }
    } catch (err) {
      alert(err.message || "Error deleting scan center");
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
        showToggleAction={false}
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
    </>
  );
}
