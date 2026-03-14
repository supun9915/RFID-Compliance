import React from "react";
import { DataTable } from "../components/Shared/DataTable";
export function AdminUsers() {
  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Full Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "branch",
      label: "Branch",
    },
    {
      key: "status",
      label: "Active",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
    },
  ];

  const data = [
    {
      id: "97",
      name: "Menuka Senevi",
      email: "menuka@zenzebz.com",
      role: "Administrator",
      branch: "Headquarters",
      status: "Active",
      lastLogin: "2026-02-06 06:14:13",
    },
    {
      id: "94",
      name: "Sarah Johnson",
      email: "sarah.j@police.gov",
      role: "Officer",
      branch: "North Station",
      status: "Active",
      lastLogin: "2026-01-31 19:52:26",
    },
    {
      id: "92",
      name: "Alina Watson",
      email: "watson@gmail.com",
      role: "Viewer",
      branch: "City Hall",
      status: "Active",
      lastLogin: "2026-01-13 11:34:06",
    },
    {
      id: "83",
      name: "Test User",
      email: "testuser@gmail.com",
      role: "Mobile User",
      branch: "Patrol Unit 1",
      status: "Active",
      lastLogin: "2025-12-16 05:47:37",
    },
    {
      id: "75",
      name: "Ben Stokes",
      email: "ben@gmail.com",
      role: "Officer",
      branch: "South Station",
      status: "Active",
      lastLogin: "2025-12-07 15:51:32",
    },
    {
      id: "68",
      name: "Salesman Test",
      email: "salesman@gmail.com",
      role: "Auditor",
      branch: "HQ",
      status: "Active",
      lastLogin: "2025-11-24 20:20:23",
    },
  ];

  return <DataTable title="System Users" columns={columns} data={data} />;
}
