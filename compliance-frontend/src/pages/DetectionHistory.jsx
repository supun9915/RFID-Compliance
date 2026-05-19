import React, { useState, useEffect, useCallback } from "react";
import { getDetections } from "../api/detectionsApi";
import { getScanCenters } from "../api/scanCentersApi";
import { getUserRole, ROLES } from "../components/Data/Permissions";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react";

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "VALID", label: "Valid" },
  { value: "NEAR_EXPIRY", label: "Near Expiry" },
  { value: "EXPIRED", label: "Expired" },
  { value: "UNKNOWN", label: "Unknown" },
];

const STATUS_STYLES = {
  VALID: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  EXPIRED: "bg-red-50 text-red-700 border border-red-100",
  NEAR_EXPIRY: "bg-amber-50 text-amber-700 border border-amber-100",
  UNKNOWN: "bg-gray-100 text-gray-600 border border-gray-200",
};

const STATUS_LABELS = {
  VALID: "Valid",
  NEAR_EXPIRY: "Near Expiry",
  EXPIRED: "Expired",
  UNKNOWN: "Unknown",
};

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function DetectionHistory() {
  const [data, setData] = useState([]);
  const [scanCenters, setScanCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userRole = getUserRole();
  const isScanCenterRole =
    userRole === ROLES.SCAN_CENTER_ADMIN || userRole === ROLES.SCAN_CENTER_USER;

  // Derive user's assigned scan center from localStorage profile
  const assignedScanCenter = React.useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const user = JSON.parse(stored);
      return user.scanCenter || null;
    } catch (_) {
      return null;
    }
  }, []);

  const [filterScanCenter, setFilterScanCenter] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return "";
      const user = JSON.parse(stored);
      const role = user.role || user.userRole || "";
      const roleName =
        typeof role === "object" ? role.name || role.roleName || "" : role;
      if (
        (roleName === ROLES.SCAN_CENTER_ADMIN ||
          roleName === ROLES.SCAN_CENTER_USER) &&
        user.scanCenter?.id
      ) {
        return String(user.scanCenter.id);
      }
    } catch (_) {}
    return "";
  });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReader, setFilterReader] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load scan centers for the dropdown (only for roles that can see all)
  useEffect(() => {
    if (!isScanCenterRole) {
      getScanCenters().then((res) => {
        if (res.success) setScanCenters(res.data || []);
      });
    }
  }, [isScanCenterRole]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDetections({
        scanCenterId: filterScanCenter || null,
        status: filterStatus || null,
        readerId: filterReader || null,
      });
      if (res.success) {
        setData(res.data);
        setCurrentPage(1);
      } else {
        setError(res.message || "Failed to fetch detection history");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterScanCenter, filterStatus, filterReader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive unique readers from current data for the reader dropdown
  const uniqueReaders = React.useMemo(() => {
    const map = new Map();
    data.forEach((row) => {
      if (row.readerId && !map.has(row.readerId)) {
        map.set(row.readerId, row.readerName || `Reader ${row.readerId}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Reset reader filter when scan center changes (readers belong to scan centers)
  const handleScanCenterChange = (val) => {
    setFilterScanCenter(val);
    setFilterReader("");
  };

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Detection History</h2>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Scan Center */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scan Center
            </label>
            {isScanCenterRole ? (
              <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                {assignedScanCenter?.name || "Assigned Scan Center"}
              </div>
            ) : (
              <select
                value={filterScanCenter}
                onChange={(e) => handleScanCenterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">All Scan Centers</option>
                {scanCenters.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reader */}
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reader
            </label>
            <select
              value={filterReader}
              onChange={(e) => setFilterReader(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              disabled={uniqueReaders.length === 0}
            >
              <option value="">All Readers</option>
              {uniqueReaders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-auto h-[580px]">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Reg. No.",
                  "Owner",
                  "Vehicle Type",
                  "Model",
                  "Scan Center",
                  "Reader",
                  "Status",
                  "Detected At",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No detections found.
                  </td>
                </tr>
              )}
              {!loading &&
                pageData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {row.vehicleRegistrationNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <div>{row.ownerFullName}</div>
                      <div className="text-xs text-gray-400">
                        {row.ownerNic}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {row.vehicleType?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {row.vehicleModel?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="whitespace-nowrap">
                        {row.scanCenterName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {row.scanCenterCity}, {row.scanCenterDistrict}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="whitespace-nowrap">{row.readerName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_STYLES[row.complianceStatus] ||
                          "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {STATUS_LABELS[row.complianceStatus] ||
                          row.complianceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                      {formatDateTime(row.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="mr-2">
              {data.length === 0
                ? "0–0 of 0"
                : `${startIndex + 1}–${Math.min(startIndex + rowsPerPage, data.length)} of ${data.length}`}
            </span>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
