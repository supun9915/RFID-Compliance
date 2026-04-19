import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function ComplianceAlerts({ detections = [], loading = false }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter only non-compliant detections (EXPIRED status)
  const nonCompliantDetections = detections;

  // Format detection time
  const formatDetectionTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);

    // Format date as: Apr 19, 2026
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Format time as: 2:30 PM
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateStr} ${timeStr}`;
  };

  // Parse compliance message to extract document statuses
  const parseComplianceMessage = (message) => {
    if (!message) return [];

    const documents = [];
    const parts = message.split("|").map((part) => part.trim());

    parts.forEach((part) => {
      if (part.includes(":")) {
        const [doc, fullStatus] = part.split(":").map((s) => s.trim());
        // Extract only the status before "—" if it exists
        const status = fullStatus.split("—")[0].trim();
        documents.push({ name: doc, status });
      }
    });

    return documents;
  };

  // Get document status badge styling
  const getDocumentStatusStyle = (status) => {
    const statusLower = status.toLowerCase();

    if (statusLower === "valid") {
      return {
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-100",
        icon: CheckCircle2,
        iconColor: "text-green-700",
      };
    } else if (statusLower === "expired") {
      return {
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-100",
        icon: XCircle,
        iconColor: "text-red-600",
      };
    } else if (
      statusLower.includes("near expiry") ||
      statusLower.includes("expiring")
    ) {
      return {
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-100",
        icon: AlertCircle,
        iconColor: "text-amber-600",
      };
    } else {
      return {
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-100",
        icon: AlertCircle,
        iconColor: "text-gray-600",
      };
    }
  };

  // Get overall status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "EXPIRED":
        return "bg-red-50 text-red-700 border border-red-100";
      case "VALID":
        return "bg-green-50 text-green-700 border border-green-100";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-100";
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(nonCompliantDetections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDetections = nonCompliantDetections.slice(startIndex, endIndex);

  // Reset to page 1 when detections change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [detections.length]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Compliance Alerts
        </h3>
        <span className="text-sm text-gray-500 font-medium">
          {nonCompliantDetections.length} alerts
        </span>
      </div>

      <div className="overflow-y-auto flex-1 p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-gray-400">Loading alerts...</div>
          </div>
        ) : nonCompliantDetections.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No compliance alerts</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentDetections.map((detection) => {
              const documents = parseComplianceMessage(
                detection.complianceMessage,
              );

              return (
                <div
                  key={detection.id}
                  className="p-5  transition-colors cursor-pointer"
                >
                  {/* Vehicle Info Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: Vehicle Info */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 text-base">
                          {detection.vehicleRegistrationNumber}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(detection.complianceStatus)}`}
                        >
                          {detection.complianceStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {detection.ownerFullName}
                      </p>
                    </div>

                    {/* Middle: Document Status Badges */}
                    <div className=" flex-col items-end gap-2 ml-auto">
                      {documents.map((doc, idx) => {
                        const style = getDocumentStatusStyle(doc.status);
                        const Icon = style.icon;

                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center ml-1 gap-2 px-3 py-1.5 rounded-lg border ${style.bgColor} ${style.borderColor} ${style.textColor}`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${style.iconColor}`}
                            />
                            <span className="text-xs font-medium">
                              {doc.name}
                            </span>
                            <span className="text-xs">•</span>
                            <span className="text-xs font-semibold">
                              {doc.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Timestamp */}
                    <div className="flex flex-col items-end gap-2 ml-auto">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDetectionTime(detection.createdAt)}
                      </div>
                      {detection.complianceMessage && (
                        <div className="text-xs text-gray-600 text-right max-w-xs">
                          {detection.complianceMessage.includes("—")
                            ? detection.complianceMessage.split("—")[1].trim()
                            : detection.complianceMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && nonCompliantDetections.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, nonCompliantDetections.length)} of{" "}
            {nonCompliantDetections.length} alerts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
