import React from "react";
import { DataTable } from "../components/Shared/DataTable";
export function Entrances() {
  const columns = [
    {
      key: "id",
      label: "Gate ID",
    },
    {
      key: "name",
      label: "Location Name",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "camera",
      label: "Camera ID",
    },
    {
      key: "rfid",
      label: "RFID Reader ID",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === "Online" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
        >
          {value}
        </span>
      ),
    },
  ];

  const data = [
    {
      id: "G-01",
      name: "Main North Gate",
      type: "Entry/Exit",
      camera: "CAM-N01",
      rfid: "RF-N01",
      status: "Online",
    },
    {
      id: "G-02",
      name: "South Cargo Entrance",
      type: "Entry Only",
      camera: "CAM-S01",
      rfid: "RF-S01",
      status: "Online",
    },
    {
      id: "G-03",
      name: "East Staff Gate",
      type: "Entry/Exit",
      camera: "CAM-E01",
      rfid: "RF-E01",
      status: "Online",
    },
    {
      id: "G-04",
      name: "West Emergency Exit",
      type: "Exit Only",
      camera: "CAM-W01",
      rfid: "RF-W01",
      status: "Offline",
    },
    {
      id: "G-05",
      name: "Logistics Bay 1",
      type: "Entry Only",
      camera: "CAM-L01",
      rfid: "RF-L01",
      status: "Online",
    },
  ];

  return (
    <DataTable
      title="Entrance & Gate Management"
      columns={columns}
      data={data}
    />
  );
}
