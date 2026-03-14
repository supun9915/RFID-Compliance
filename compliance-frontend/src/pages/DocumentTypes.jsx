import React, { useState, useEffect } from "react";
import { DataTable } from "../components/Shared/DataTable";
import {
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
} from "../api/documentTypesApi";

export function DocumentTypes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setData(result.data || []);
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

  const handleCreate = async (newDocumentType) => {
    try {
      const result = await createDocumentType(newDocumentType);
      if (result.success) {
        // Refresh the list after successful creation
        await fetchDocumentTypes();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to create document type",
      };
    }
  };

  const handleUpdate = async (id, updatedDocumentType) => {
    try {
      const result = await updateDocumentType(id, updatedDocumentType);
      if (result.success) {
        // Refresh the list after successful update
        await fetchDocumentTypes();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to update document type",
      };
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
    <DataTable
      title="Document Types"
      columns={columns}
      data={data}
      onRefresh={fetchDocumentTypes}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
    />
  );
}
