import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { TopBar } from "./components/Layout/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { Owners } from "./pages/Owners/Owners";
import { OwnerVehiclesPage } from "./pages/Owners/OwnerVehiclesPage";
import { DocumentTypes } from "./pages/DocumentTypes";
import { VehicleTypes } from "./pages/VehicleTypes";
import { VehicleMakes } from "./pages/VehicleMakes";
import { VehicleModels } from "./pages/VehicleModels";
import { ScanCenters } from "./pages/ScanCenters";
import { AdminUsers } from "./pages/AdminUsers";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { isAuthenticated } from "./api/authApi";
import { ApiResponsePopup } from "./components/Shared/ApiResponsePopup";
import { subscribeToResponseNotifications } from "./utils/responseNotifier";

export function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeOwner, setActiveOwner] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const unsubscribe = subscribeToResponseNotifications((payload) => {
      setPopup({
        open: true,
        type: payload?.type || "success",
        title: payload?.title || "",
        message: payload?.message || "",
      });
    });

    return unsubscribe;
  }, []);

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, open: false }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "owners":
        return (
          <Owners
            onViewVehicles={(owner) => {
              setActiveOwner(owner);
              setCurrentPage("ownerVehicles");
            }}
          />
        );
      case "ownerVehicles":
        return (
          <OwnerVehiclesPage
            owner={activeOwner}
            onBack={() => {
              setCurrentPage("owners");
              setActiveOwner(null);
            }}
          />
        );
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
    <>
      {!authenticated ? (
        <Login onLoginSuccess={() => setAuthenticated(true)} />
      ) : (
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
      )}

      <ApiResponsePopup
        open={popup.open}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        buttonLabel="OK"
        onClose={closePopup}
      />
    </>
  );
}
