import React, { useState, useEffect } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  getVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from "../api/vehicleTypesApi";
import { X } from "lucide-react";

export function VehicleTypes() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "" });
  const [error, setError] = useState(null);

  // Fetch vehicle types on component mount
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const response = await getVehicleTypes();
      if (response.success) {
        setVehicleTypes(response.data);
      } else {
        setError("Failed to fetch vehicle types");
      }
    } catch (err) {
      setError("Error fetching vehicle types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: "" });
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({ id: row.id, name: row.name });
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      try {
        const response = await deleteVehicleType(row.id);
        if (response.success) {
          fetchVehicleTypes();
          alert("Vehicle type deleted successfully");
        } else {
          alert("Failed to delete vehicle type");
        }
      } catch (err) {
        alert("Error deleting vehicle type");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a vehicle type name");
      return;
    }

    try {
      let response;
      if (editMode) {
        response = await updateVehicleType(formData.id, {
          name: formData.name,
        });
      } else {
        response = await createVehicleType({ name: formData.name });
      }

      if (response.success) {
        fetchVehicleTypes();
        setShowModal(false);
        setFormData({ id: null, name: "" });
        alert(
          editMode
            ? "Vehicle type updated successfully"
            : "Vehicle type created successfully",
        );
      } else {
        alert("Failed to save vehicle type");
      }
    } catch (err) {
      alert("Error saving vehicle type");
      console.error(err);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Vehicle Type Name",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading vehicle types...</div>
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
        title="Vehicle Types"
        columns={columns}
        data={vehicleTypes}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {editMode ? "Edit Vehicle Type" : "Add Vehicle Type"}
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
                    Vehicle Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter vehicle type name"
                    required
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
    </>
  );
}
