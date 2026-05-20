import React, { useState, useEffect } from "react";
import { StatCard } from "../components/Dashboard/StatCard";
import { ComplianceAlerts } from "../components/Dashboard/ComplianceAlerts";
import { LiveDetectionFeed } from "../components/Dashboard/LiveDetectionFeed";
import { Car, FileWarning, Radio, AlertOctagon, RefreshCw } from "lucide-react";
import { getScanCenters } from "../api/scanCentersApi";
import { getDetections } from "../api/detectionsApi";
import { getUserRole, ROLES } from "../components/Data/Permissions";

export function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [scanCenters, setScanCenters] = useState([]);
  const [selectedScanCenter, setSelectedScanCenter] = useState("");
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userRole = getUserRole();
  const isScanCenterRole =
    userRole === ROLES.SCAN_CENTER_ADMIN || userRole === ROLES.SCAN_CENTER_USER;

  // Get user profile from localStorage (set during login)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(userData);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  // Fetch scan centers if user has no assigned scan center
  useEffect(() => {
    const fetchScanCenters = async () => {
      if (userProfile && userProfile.scanCenter === null) {
        const response = await getScanCenters();
        if (response.success) {
          setScanCenters(response.data);
        }
      }
    };

    fetchScanCenters();
  }, [userProfile]);

  // Fetch detections based on selected scan center or user's assigned scan center
  const fetchDetections = async () => {
    if (!userProfile) return;

    setLoading(true);
    const params = {};

    // If user has an assigned scan center, use it
    if (userProfile.scanCenter && userProfile.scanCenter.id) {
      params.scanCenterId = userProfile.scanCenter.id;
    }
    // Otherwise, use the selected scan center from dropdown (if any)
    else if (selectedScanCenter) {
      params.scanCenterId = selectedScanCenter;
    }
    // If no scan center selected and user has no assigned scan center, fetch all

    const response = await getDetections(params);
    if (response.success) {
      setDetections(response.data);
    }
    setLoading(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDetections();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDetections();

    // Auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchDetections();
    }, 100000); // 100000 ms = 100 seconds

    // Cleanup interval on component unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [selectedScanCenter, userProfile]);

  // Calculate statistics from detections
  const totalRegistered = detections.length;
  const expiredCount = detections.filter(
    (d) => d.complianceStatus === "EXPIRED",
  ).length;
  const validCount = detections.filter(
    (d) => d.complianceStatus === "VALID",
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {userProfile?.firstName || "Officer"}. Here's what's
            happening today.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {isScanCenterRole && userProfile?.scanCenter ? (
            <span className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2">
              {userProfile.scanCenter.name}
            </span>
          ) : (
            !isScanCenterRole &&
            userProfile?.scanCenter === null &&
            scanCenters.length > 0 && (
              <select
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={selectedScanCenter}
                onChange={(e) => setSelectedScanCenter(e.target.value)}
              >
                <option value="">All Locations</option>
                {scanCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            )
          )}
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </div>

      {/* Main Content Grid - Alerts Table (Left, Larger) and Live Feed + Small Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Compliance Alerts Table (Takes up 4/5 width) */}
        <div className="lg:col-span-4 h-[700px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">
              Compliance Alerts
            </h2>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <ComplianceAlerts detections={detections} loading={loading} />
        </div>

        {/* Right Column: Stats Summary and Live Feed (Takes up 1/5 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Compact Stats Cards */}
          <div className="space-y-3">
            <StatCard
              title="Total Registered"
              value={totalRegistered.toLocaleString()}
              trend="+12% this month"
              trendUp={true}
              icon={Car}
              color="blue"
            />

            <StatCard
              title="Expired Documents"
              value={expiredCount.toLocaleString()}
              trend="+5% vs last week"
              trendUp={false}
              icon={FileWarning}
              color="red"
            />

            <StatCard
              title="Valid Documents"
              value={validCount.toLocaleString()}
              trend="-2% vs yesterday"
              trendUp={true}
              icon={Radio}
              color="green"
            />
            <StatCard
              title="Recent Violations"
              value={expiredCount.toLocaleString()}
              trend="-2% vs yesterday"
              trendUp={true}
              icon={AlertOctagon}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
