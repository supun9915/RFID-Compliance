import React, { useState, useEffect } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  updateDocumentTypeStatus,
} from "../api/documentTypesApi";
import { X } from "lucide-react";
import { ApiResponsePopup } from "../components/Shared/ApiResponsePopup";
import { notifyResponse } from "../utils/responseNotifier";

export function DocumentTypes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    active: true,
  });

  const columns = [
    {
      key: "id",
      label: "Code",
    },
    {
      key: "name",
      label: "Document Name",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "duration",
      label: "Duration (months)",
      render: (value) => (value != null && value !== "" ? value : "N/A"),
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

  // Fetch document types on component mount
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDocumentTypes();
      if (result.success) {
        const normalized = (result.data || []).map((item) => ({
          ...item,
          status: item.active ? "Active" : "Inactive",
          active: item.active,
        }));
        console.log("data", normalized);
        setData(normalized);
      } else {
        setError(result.message || "Failed to fetch document types");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching document types",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      id: null,
      name: "",
      description: "",
      zplCode: "",
      duration: "",
    });
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      zplCode: row.zplCode || "",
      duration: row.duration ?? "",
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
      const result = await deleteDocumentType(target.id);
      if (result.success) {
        await fetchDocumentTypes();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to delete document type",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error deleting document type",
      });
    }
  };

  const handleToggleStatus = async (row) => {
    const nextActive = !row.active;
    const actionLabel = nextActive ? "activate" : "deactivate";

    try {
      const result = await updateDocumentTypeStatus(row.id, nextActive);
      if (result.success) {
        await fetchDocumentTypes();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: `Failed to ${actionLabel} document type`,
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || `Error trying to ${actionLabel} document type`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notifyResponse({
        type: "error",
        title: "Validation Error",
        message: "Please enter a document type name",
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      zplCode: formData.zplCode.trim() || null,
      duration: formData.duration !== "" ? Number(formData.duration) : null,
    };

    try {
      const result = editMode
        ? await updateDocumentType(formData.id, payload)
        : await createDocumentType(payload);

      if (result.success) {
        setShowModal(false);
        setFormData({
          id: null,
          name: "",
          description: "",
          zplCode: "",
          duration: "",
        });
        await fetchDocumentTypes();
      } else if (!result?.message && !result?.error) {
        notifyResponse({
          type: "error",
          title: "Error",
          message: "Failed to save document type",
        });
      }
    } catch (err) {
      notifyResponse({
        type: "error",
        title: "Error",
        message: err.message || "Error saving document type",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading document types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button
          onClick={fetchDocumentTypes}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        title="Document Types"
        columns={columns}
        data={data}
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
                {editMode ? "Edit Document Type" : "Add Document Type"}
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
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter document type name"
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
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label
                    htmlFor="zplCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ZPL Code
                  </label>
                  <input
                    id="zplCode"
                    type="text"
                    value={formData.zplCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zplCode: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Optional ZPL code"
                  />
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration (Months)
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Optional duration in days"
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
        title="Delete Document Type"
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
