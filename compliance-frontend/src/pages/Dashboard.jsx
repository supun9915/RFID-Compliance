import React from "react";
import { StatCard } from "../components/Dashboard/StatCard";
import { ComplianceAlerts } from "../components/Dashboard/ComplianceAlerts";
import { LiveDetectionFeed } from "../components/Dashboard/LiveDetectionFeed";
import { Car, FileWarning, Radio, AlertOctagon } from "lucide-react";
export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, Officer Sarah. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500">
            <option>All Locations</option>
            <option>North Gate</option>
            <option>South Exit</option>
            <option>Main Highway</option>
          </select>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered"
          value="24,592"
          trend="+12% this month"
          trendUp={true}
          icon={Car}
          color="blue"
        />

        <StatCard
          title="Expired Documents"
          value="1,204"
          trend="+5% vs last week"
          trendUp={false}
          icon={FileWarning}
          color="amber"
        />

        <StatCard
          title="Active RFID Readers"
          value="48/50"
          trend="2 Offline"
          trendUp={false}
          icon={Radio}
          color="green"
        />

        <StatCard
          title="Recent Violations"
          value="86"
          trend="-2% vs yesterday"
          trendUp={true}
          icon={AlertOctagon}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Column: Live Feed (Takes up 2/3 width) */}
        <div className="lg:col-span-2 h-full">
          <LiveDetectionFeed />
        </div>

        {/* Right Column: Compliance Alerts (Takes up 1/3 width) */}
        <div className="lg:col-span-1 h-full">
          <ComplianceAlerts />
        </div>
      </div>
    </div>
  );
}
