import React, { useState, useEffect, useMemo } from "react";
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
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

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
  const fetchDetections = async (showLoading = true) => {
    if (!userProfile) return;

    if (showLoading) setLoading(true);
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
    if (showLoading) setLoading(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDetections();
    setRefreshing(false);
  };

  const handleGenerateReport = () => {
    const dateRangeLabel = (() => {
      if (dateFilter === "today") return "Today";
      if (dateFilter === "yesterday") return "Yesterday";
      if (dateFilter === "lastWeek") return "Last 7 Days";
      if (dateFilter === "custom") {
        const from = customStartDate || "—";
        const to = customEndDate || "—";
        return `${from} to ${to}`;
      }
      return "All Time";
    })();

    const scanCenterLabel =
      userProfile?.scanCenter?.name ||
      (selectedScanCenter
        ? scanCenters.find((c) => String(c.id) === String(selectedScanCenter))
            ?.name || selectedScanCenter
        : "All Locations");

    const expiredRows = filteredDetections.filter(
      (d) => d.complianceStatus === "EXPIRED",
    ).length;
    const validRows = filteredDetections.filter(
      (d) => d.complianceStatus === "VALID",
    ).length;

    const rows = [...filteredDetections]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .map((d) => {
        const statusColor =
          d.complianceStatus === "VALID"
            ? "#16a34a"
            : d.complianceStatus === "EXPIRED"
              ? "#dc2626"
              : "#d97706";

        // Parse document statuses from complianceMessage
        const docParts = (d.complianceMessage || "")
          .split("|")
          .map((p) => p.trim())
          .filter((p) => p.includes(":"))
          .map((p) => {
            const [doc, rest] = p.split(":").map((s) => s.trim());
            const status = rest ? rest.split("—")[0].trim() : "";
            return `${doc}: ${status}`;
          })
          .join("<br/>");

        const detectedAt = d.createdAt
          ? new Date(d.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";

        return `
          <tr>
            <td>${d.vehicleNumber || "—"}</td>
            <td>${d.ownerFullName || "—"}</td>
            <td style="text-align:center">
              <span style="background:${statusColor};color:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600">
                ${d.complianceStatus || "—"}
              </span>
            </td>
            <td style="font-size:11px;line-height:1.6">${docParts || "—"}</td>
            <td style="white-space:nowrap">${detectedAt}</td>
          </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>RFID Compliance Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #111; }
    .header p { font-size: 12px; color: #555; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; color: #555; line-height: 1.8; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .summary-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .summary-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
    .summary-card .value { font-size: 24px; font-weight: 700; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead { background: #f3f4f6; }
    th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #374151; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print {
      body { padding: 16px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>RFID Compliance Report</h1>
      <p>Scan Center: <strong>${scanCenterLabel}</strong> &nbsp;|&nbsp; Period: <strong>${dateRangeLabel}</strong></p>
    </div>
    <div class="meta">
      Generated by: ${userProfile?.firstName || ""} ${userProfile?.lastName || ""}<br/>
      Role: ${userProfile?.role || "—"}<br/>
      Date: ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Detections</div>
      <div class="value" style="color:#111">${filteredDetections.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Valid</div>
      <div class="value" style="color:#16a34a">${validRows}</div>
    </div>
    <div class="summary-card">
      <div class="label">Expired</div>
      <div class="value" style="color:#dc2626">${expiredRows}</div>
    </div>
    <div class="summary-card">
      <div class="label">Other</div>
      <div class="value" style="color:#d97706">${filteredDetections.length - validRows - expiredRows}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Vehicle No.</th>
        <th>Owner</th>
        <th style="text-align:center">Status</th>
        <th>Documents</th>
        <th>Detected At</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="5" style="text-align:center;padding:24px;color:#9ca3af">No detections found for the selected period.</td></tr>'}
    </tbody>
  </table>

  <div class="footer">RFID Compliance System &mdash; This report is system-generated.</div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  useEffect(() => {
    fetchDetections();

    // Auto-refresh every 5 seconds (background — no loading spinner)
    const intervalId = setInterval(() => {
      fetchDetections(false);
    }, 1000);

    // Cleanup interval on component unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [selectedScanCenter, userProfile]);

  // Filter detections by selected date (shared with ComplianceAlerts)
  const filteredDetections = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfLastWeek = new Date(startOfToday);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    return detections.filter((d) => {
      if (!d.createdAt) return false;
      const t = new Date(d.createdAt);
      if (Number.isNaN(t.getTime())) return false;

      if (dateFilter === "today")
        return t >= startOfToday && t < startOfTomorrow;
      if (dateFilter === "yesterday")
        return t >= startOfYesterday && t < startOfToday;
      if (dateFilter === "lastWeek")
        return t >= startOfLastWeek && t < startOfTomorrow;
      if (dateFilter === "custom") {
        const start = customStartDate ? new Date(customStartDate) : null;
        const end = customEndDate
          ? new Date(
              new Date(customEndDate).setDate(
                new Date(customEndDate).getDate() + 1,
              ),
            )
          : null;
        if (start && end) return t >= start && t < end;
        if (start) return t >= start;
        if (end) return t < end;
        return true;
      }
      return true;
    });
  }, [detections, dateFilter, customStartDate, customEndDate]);

  // Calculate statistics from filtered detections
  const totalRegistered = filteredDetections.length;
  const expiredCount = filteredDetections.filter(
    (d) => d.complianceStatus === "EXPIRED",
  ).length;
  const validCount = filteredDetections.filter(
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
          <button
            onClick={handleGenerateReport}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
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
          <ComplianceAlerts
            detections={detections}
            loading={loading}
            dateFilter={dateFilter}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onDateFilterChange={setDateFilter}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />
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

          {/* Live Detection Feed */}
          <LiveDetectionFeed detections={filteredDetections} />
        </div>
      </div>
    </div>
  );
}
