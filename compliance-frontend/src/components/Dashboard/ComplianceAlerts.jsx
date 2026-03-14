import React from "react";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
export function ComplianceAlerts() {
  const alerts = [
    {
      id: 1,
      plate: "ABC-1234",
      owner: "Logistics Corp",
      issue: "Insurance Expired",
      status: "Expired",
      days: -5,
    },
    {
      id: 2,
      plate: "XYZ-9876",
      owner: "John Doe",
      issue: "Registration Low",
      status: "Warning",
      days: 2,
    },
    {
      id: 3,
      plate: "LMN-4567",
      owner: "City Transport",
      issue: "Emission Fail",
      status: "Violation",
      days: 0,
    },
    {
      id: 4,
      plate: "QWE-2345",
      owner: "Sarah Smith",
      issue: "Insurance Low",
      status: "Warning",
      days: 5,
    },
    {
      id: 5,
      plate: "RTY-6789",
      owner: "BuildCo Ltd",
      issue: "Permit Missing",
      status: "Violation",
      days: -12,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Low Compliance Alerts
        </h3>
        <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
          View All
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Issue</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{alert.plate}</div>
                  <div className="text-xs text-gray-500">{alert.owner}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="text-gray-700">{alert.issue}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.days < 0
                      ? `${Math.abs(alert.days)} days ago`
                      : `In ${alert.days} days`}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.status === "Expired" || alert.status === "Violation" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 w-full">
          See 12 more alerts <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
