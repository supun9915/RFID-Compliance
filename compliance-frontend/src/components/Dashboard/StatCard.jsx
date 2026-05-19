import React from "react";
export function StatCard({ title, value, trend, trendUp, icon: Icon, color }) {
  const colorStyles = {
    blue: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
    red: "bg-gradient-to-br from-red-400 to-red-600 text-white",
    green: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
    amber: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
    purple: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
