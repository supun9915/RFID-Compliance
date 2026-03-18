import React, { useState, useEffect } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  getVehicleMakes,
  createVehicleMake,
  updateVehicleMake,
  deleteVehicleMake,
  updateVehicleMakeStatus,
} from "../api/vehicleMakesApi";
import { X } from "lucide-react";
import { ApiResponsePopup } from "../components/Shared/ApiResponsePopup";
import { notifyResponse } from "../utils/responseNotifier";

export function VehicleMakes() {
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicleMakes();
  }, []);

  const fetchVehicleMakes = async () => {
    try {
      setLoading(true);
      const response = await getVehicleMakes();
      if (response.success) {
        const normalized = (response.data || []).map((item) => ({
          ...item,
          status: item.active ? "Active" : "Inactive",
          active: item.active,
        }));
        setVehicleMakes(normalized);
      } else {
        setError("Failed to fetch vehicle makes");
      }
    } catch (err) {
      setError("Error fetching vehicle makes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      id: row.id,
      name: row.name,
      description: row.description || "",
    });
    setShowModal(true);
  };

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
      const response = await deleteVehicleMake(target.id);
      if (response.success) {
        fetchVehicleMakes();
      } else if (!response?.message && !response?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to delete vehicle make",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error deleting vehicle make",
      });
      console.error(err);
    }
  };

  const handleToggleStatus = async (row) => {
    const nextActive = !row.active;
    const actionLabel = nextActive ? "activate" : "deactivate";

    try {
      const response = await updateVehicleMakeStatus(row.id, nextActive);
      if (response.success) {
        await fetchVehicleMakes();
      } else if (!response?.message && !response?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: `Failed to ${actionLabel} vehicle make`,
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || `Error trying to ${actionLabel} vehicle make`,
      });
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notifyResponse({
        type: "error",
        title: "Validation Error",
        message: "Please enter a vehicle make name",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      let response;
      if (editMode) {
        response = await updateVehicleMake(formData.id, payload);
      } else {
        response = await createVehicleMake(payload);
      }

      if (response.success) {
        fetchVehicleMakes();
        setShowModal(false);
        setFormData({ id: null, name: "", description: "" });
      } else if (!response?.message && !response?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to save vehicle make",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error saving vehicle make",
      });
      console.error(err);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Make Name" },
    { key: "description", label: "Description" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading vehicle makes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        title="Vehicle Makes"
        columns={columns}
        data={vehicleMakes}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {editMode ? "Edit Vehicle Make" : "Add Vehicle Make"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Make Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. Toyota"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
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
        title="Delete Vehicle Make"
        message={`Are you sure you want to delete "${deleteTarget?.name || ""}"?`}
        buttonLabel="Delete"
        cancelLabel="Cancel"
        showCancel
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
