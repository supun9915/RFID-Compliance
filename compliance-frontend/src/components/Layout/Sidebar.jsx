import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Car,
  ShieldCheck,
  Factory,
  Layers,
  Radar,
  Activity,
  UserCircle,
  Printer,
  Settings,
  Search,
} from "lucide-react";
import { canView, PAGES, getUserRole } from "../Data/Permissions";

export function Sidebar({ activePage, onNavigate }) {
  const userRole = getUserRole();

  const navItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      page: PAGES.DASHBOARD,
    },
    {
      id: "documents",
      icon: FileText,
      label: "Document Type",
      page: PAGES.DOCUMENT_TYPE,
    },
    {
      id: "vehicles",
      icon: Car,
      label: "Vehicle Type",
      page: PAGES.VEHICLE_TYPES,
    },
    {
      id: "scanCenters",
      icon: Radar,
      label: "Scan Centers",
      page: PAGES.SCAN_CENTER,
    },
    {
      id: "detections",
      icon: Activity,
      label: "Detection History",
      page: PAGES.DETECTION_HISTORY,
    },
    {
      id: "owners",
      icon: Users,
      label: "Owners",
      page: PAGES.OWNERS,
    },
    {
      id: "myVehicles",
      icon: Car,
      label: "My Vehicles",
      page: PAGES.VEHICLE,
    },
    {
      id: "vehicleSearch",
      icon: Search,
      label: "Vehicle Search",
      page: PAGES.VEHICLE_SEARCH,
    },
    {
      id: "admins",
      icon: ShieldCheck,
      label: "Admin Users",
      page: PAGES.ADMIN_USERS,
    },
    {
      id: "vehicleMakes",
      icon: Factory,
      label: "Vehicle Makes",
      page: PAGES.VEHICLE_MAKES,
    },
    {
      id: "vehicleModels",
      icon: Layers,
      label: "Vehicle Models",
      page: PAGES.VEHICLE_MODELS,
    },
    {
      id: "vehiclePrint",
      icon: Printer,
      label: "RFID Label Print",
      page: PAGES.VEHICLE_PRINT,
    },
  ].filter((item) => canView(userRole, item.page));

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-gray-800 z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            <img
              src="/Logo65.png"
              alt="Logo"
              className="w-full p-0.5 h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg tracking-tight">AutoComply</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === item.id ? "bg-gray-200  text-gray-900 shadow-lg shadow-gray-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}

        <div className="mt-8 px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </div>
        <button
          onClick={() => onNavigate("account")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === "account" ? "bg-gray-200 text-gray-900 shadow-lg shadow-gray-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
        >
          <UserCircle className="w-5 h-5" />
          My Account
        </button>
        {canView(userRole, PAGES.PRINTER_SETTINGS) && (
          <button
            onClick={() => onNavigate("printerSettings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === "printerSettings" ? "bg-gray-200 text-gray-900 shadow-lg shadow-gray-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Settings className="w-5 h-5" />
            Printer Settings
          </button>
        )}
      </nav>
    </aside>
  );
}
