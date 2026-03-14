import React from "react";
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
export function DataTable({ title, columns, data, onAdd, onEdit, onDelete }) {
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
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {title}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, idx) => (
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 transition-opacity">
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit"
                        onClick={() => onEdit && onEdit(row)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400  hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete"
                        onClick={() => onDelete && onDelete(row)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            0 of {data.length} row(s) selected
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <span>Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                disabled
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                disabled
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                disabled
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                disabled
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
