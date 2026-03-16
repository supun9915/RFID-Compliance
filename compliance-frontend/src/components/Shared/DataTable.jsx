import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  ToggleRight,
  ToggleLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from "lucide-react";
export function DataTable({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  showAddButton = true,
  showActions = true,
  showDeleteAction = true,
  showToggleAction = true,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {showAddButton && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add {title}
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Scrollable table area */}
        <div className="overflow-auto h-[680px]">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                {showActions && (
                  <th className="sticky right-0 z-40 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center bg-gray-50 border-l border-gray-200 shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.15)]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-gray-700">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="sticky right-0 z-20 px-6 py-3 text-center bg-white group-hover:bg-gray-50 border-l border-gray-100 shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center gap-2 transition-opacity">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit"
                          onClick={() => onEdit && onEdit(row)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        {showDeleteAction && (
                          <button
                            className="p-1.5 text-gray-400  hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            title="Delete"
                            onClick={() => onDelete && onDelete(row)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        {showToggleAction && (
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                            title="Toggle Status"
                          >
                            {row.active !== false ? (
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer — always visible, outside the scroll area */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {data.length === 0
              ? "No rows"
              : `${startIndex + 1}–${Math.min(startIndex + rowsPerPage, data.length)} of ${data.length} row(s)`}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
