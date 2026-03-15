import React, { useState } from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { TopBar } from "./components/Layout/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { Owners } from "./pages/Owners";
import { DocumentTypes } from "./pages/DocumentTypes";
import { VehicleTypes } from "./pages/VehicleTypes";
import { VehicleMakes } from "./pages/VehicleMakes";
import { VehicleModels } from "./pages/VehicleModels";
import { ScanCenters } from "./pages/ScanCenters";
import { AdminUsers } from "./pages/AdminUsers";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { isAuthenticated } from "./api/authApi";

export function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Show login page when not authenticated
  if (!authenticated) {
    return <Login onLoginSuccess={() => setAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "owners":
        return <Owners />;
      case "documents":
        return <DocumentTypes />;
      case "vehicles":
        return <VehicleTypes />;
      case "vehicleMakes":
        return <VehicleMakes />;
      case "vehicleModels":
        return <VehicleModels />;
      case "scanCenters":
        return <ScanCenters />;
      case "admins":
        return <AdminUsers />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Fixed Sidebar */}
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <TopBar onLogout={() => setAuthenticated(false)} />

        {/* Scrollable Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
