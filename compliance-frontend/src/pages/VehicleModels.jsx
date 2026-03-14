import React, { useState, useEffect } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  getVehicleModels,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
} from "../api/vehicleModelsApi";
import { getVehicleMakes } from "../api/vehicleMakesApi";
import { X } from "lucide-react";

export function VehicleModels() {
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    makeId: "",
    description: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsRes, makesRes] = await Promise.all([
        getVehicleModels(),
        getVehicleMakes(),
      ]);
      if (modelsRes.success) {
        setVehicleModels(modelsRes.data);
      } else {
        setError("Failed to fetch vehicle models");
      }
      if (makesRes.success) {
        setVehicleMakes(makesRes.data);
      }
    } catch (err) {
      setError("Error fetching vehicle models");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: "", makeId: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      id: row.id,
      name: row.name,
      makeId: row.make?.id ?? "",
      description: row.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      try {
        const response = await deleteVehicleModel(row.id);
        if (response.success) {
          fetchData();
          alert("Vehicle model deleted successfully");
        } else {
          alert("Failed to delete vehicle model");
        }
      } catch (err) {
        alert("Error deleting vehicle model");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a vehicle model name");
      return;
    }
    if (!formData.makeId) {
      alert("Please select a vehicle make");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        makeId: Number(formData.makeId),
        description: formData.description.trim() || null,
      };

      let response;
      if (editMode) {
        response = await updateVehicleModel(formData.id, payload);
      } else {
        response = await createVehicleModel(payload);
      }

      if (response.success) {
        fetchData();
        setShowModal(false);
        setFormData({ id: null, name: "", makeId: "", description: "" });
        alert(
          editMode
            ? "Vehicle model updated successfully"
            : "Vehicle model created successfully",
        );
      } else {
        alert("Failed to save vehicle model");
      }
    } catch (err) {
      alert("Error saving vehicle model");
      console.error(err);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Model Name" },
    {
      key: "make",
      label: "Make",
      render: (value) => value?.name ?? "—",
    },
    { key: "description", label: "Description" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading vehicle models...</div>
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
        title="Vehicle Models"
        columns={columns}
        data={vehicleModels}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {editMode ? "Edit Vehicle Model" : "Add Vehicle Model"}
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
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g. Corolla"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="makeId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Vehicle Make <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="makeId"
                    value={formData.makeId}
                    onChange={(e) =>
                      setFormData({ ...formData, makeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select a make</option>
                    {vehicleMakes.map((make) => (
                      <option key={make.id} value={make.id}>
                        {make.name}
                      </option>
                    ))}
                  </select>
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
    </>
  );
}
