import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Radio, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function LiveDetectionFeed({ detections = [] }) {
  // Group detections by hour for the chart
  const chartData = React.useMemo(() => {
    const hourMap = {};
    detections.forEach((d) => {
      const hour = new Date(d.createdAt).getHours();
      const key = `${String(hour).padStart(2, "0")}:00`;
      hourMap[key] = (hourMap[key] || 0) + 1;
    });
    return Object.entries(hourMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, count]) => ({ time, detections: count }));
  }, [detections]);

  // Latest 10 scans
  const recentScans = React.useMemo(() => {
    return [...detections]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((d) => ({
        id: d.id,
        reg: d.vehicleNumber,
        loc: d.scanCenterName,
        status:
          d.complianceStatus === "VALID"
            ? "Valid"
            : d.complianceStatus === "EXPIRED"
              ? "Expired"
              : "Warning",
        time: new Date(d.createdAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));
  }, [detections]);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-gray-600 animate-pulse" />
            Live Detection Feed
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Real-time RFID & ANPR monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-600">
            System Active
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-48 mb-6 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: 12,
              }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{
                color: "#1E293B",
              }}
            />

            <Area
              type="monotone"
              dataKey="detections"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDetections)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Scans Table */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Latest Scans
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Time</th>
                <th className="px-4 py-2">Registration</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2 rounded-r-lg text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentScans.map((scan) => (
                <tr
                  key={scan.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {scan.time}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {scan.reg}
                  </td>
                  <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {scan.loc}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {scan.status === "Valid" && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Valid
                      </span>
                    )}
                    {scan.status === "Expired" && (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                        <XCircle className="w-3 h-3" /> Expired
                      </span>
                    )}
                    {scan.status === "Warning" && (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <AlertCircle className="w-3 h-3" /> Check
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
