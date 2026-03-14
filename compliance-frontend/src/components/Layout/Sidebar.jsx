import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Car,
  BoomBox,
  ShieldCheck,
  LogOut,
  Settings,
  Factory,
  Layers,
} from "lucide-react";
export function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      id: "owners",
      icon: Users,
      label: "Owners",
    },
    {
      id: "documents",
      icon: FileText,
      label: "Document Type",
    },
    {
      id: "vehicles",
      icon: Car,
      label: "Vehicle Type",
    },
    {
      id: "entrances",
      icon: BoomBox,
      label: "Entrances",
    },
    {
      id: "admins",
      icon: ShieldCheck,
      label: "Admin Users",
    },
    {
      id: "vehicleMakes",
      icon: Factory,
      label: "Vehicle Makes",
    },
    {
      id: "vehicleModels",
      icon: Layers,
      label: "Vehicle Models",
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-gray-800 z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">V-Comply</span>
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
          System
        </div>
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === "settings" ? "bg-gray-200 text-gray-900 shadow-lg shadow-gray-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>
    </aside>
  );
}
