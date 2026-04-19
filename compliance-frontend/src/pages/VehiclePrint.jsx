import React, { useState, useCallback } from "react";
import {
  Printer,
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Tag,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getVehiclePrintTemplates,
  confirmVehiclePrint,
} from "../api/vehiclePrintsApi";
import { getSelectedPrinter, printZpl } from "../utils/zebraPrint";
import { notifyResponse } from "../utils/responseNotifier";

export function VehiclePrint({ onNavigate }) {
  const [inputValue, setInputValue] = useState("");
  const [regNumbers, setRegNumbers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printingIds, setPrintingIds] = useState(new Set());
  const [printedIds, setPrintedIds] = useState(new Set());
  const [expandedIds, setExpandedIds] = useState(new Set());

  // ── Registration number list management ──────────────────────────────────

  const addRegNumber = useCallback(() => {
    const trimmed = inputValue.trim().toUpperCase();
    if (!trimmed) return;
    const parts = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setRegNumbers((prev) => [
      ...prev,
      ...parts.filter((p) => !prev.includes(p)),
    ]);
    setInputValue("");
  }, [inputValue]);

  const removeRegNumber = (num) =>
    setRegNumbers((prev) => prev.filter((n) => n !== num));

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRegNumber();
    }
  };

  // ── Fetch templates ───────────────────────────────────────────────────────

  const handleFetch = async () => {
    if (regNumbers.length === 0) {
      notifyResponse({
        type: "error",
        title: "Validation",
        message: "Please add at least one registration number.",
      });
      return;
    }
    setLoading(true);
    setTemplates([]);
    setPrintedIds(new Set());
    setPrintingIds(new Set());
    const result = await getVehiclePrintTemplates(regNumbers);
    setLoading(false);
    if (result.success) {
      setTemplates(result.data || []);
    }
  };

  // ── Print single label ────────────────────────────────────────────────────

  const handlePrint = async (template) => {
    const printer = getSelectedPrinter();
    if (!printer) {
      notifyResponse({
        type: "error",
        title: "No Printer Selected",
        message:
          "Please go to Printer Settings and select a default Zebra printer first.",
      });
      return;
    }

    setPrintingIds((prev) => new Set([...prev, template.vehicleId]));

    const printResult = await printZpl(printer, template.zplCode);
    if (!printResult.success) {
      setPrintingIds((prev) => {
        const next = new Set(prev);
        next.delete(template.vehicleId);
        return next;
      });
      notifyResponse({
        type: "error",
        title: "Print Failed",
        message:
          printResult.error ||
          "Failed to send label to printer. Check Browser Print connection.",
      });
      return;
    }

    // Confirm print via API
    const confirmResult = await confirmVehiclePrint(
      template.vehicleNumber,
      template.epc,
    );

    setPrintingIds((prev) => {
      const next = new Set(prev);
      next.delete(template.vehicleId);
      return next;
    });

    if (confirmResult.success) {
      setPrintedIds((prev) => new Set([...prev, template.vehicleId]));
      setTemplates((prev) =>
        prev.map((t) =>
          t.vehicleId === template.vehicleId ? { ...t, isPrinted: true } : t,
        ),
      );
    }
  };

  // ── Print all ─────────────────────────────────────────────────────────────

  const handlePrintAll = async () => {
    const pending = templates.filter(
      (t) => !printedIds.has(t.vehicleId) && !printingIds.has(t.vehicleId),
    );
    for (const template of pending) {
      await handlePrint(template);
    }
  };

  // ── ZPL preview toggle ────────────────────────────────────────────────────

  const toggleExpand = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Selected printer display ──────────────────────────────────────────────

  const selectedPrinter = getSelectedPrinter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RFID Label Print</h2>
          <p className="text-sm text-gray-500 mt-1">
            Search vehicles and print RFID labels using your Zebra printer.
          </p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate("printerSettings")}
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          Printer Settings
        </button>
      </div>

      {/* Printer status banner */}
      {selectedPrinter ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>
            Active printer: <strong>{selectedPrinter.name}</strong> (
            {selectedPrinter.connection})
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            No printer selected.{" "}
            <button
              onClick={() => onNavigate && onNavigate("printerSettings")}
              className="underline font-medium"
            >
              Open Printer Settings
            </button>{" "}
            to configure a Zebra printer.
          </span>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Vehicle Search
        </h3>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter registration number (e.g., CAA-1234)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={addRegNumber}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Press Enter or comma to add multiple numbers.
        </p>

        {/* Tag list */}
        {regNumbers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {regNumbers.map((num) => (
              <span
                key={num}
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {num}
                <button
                  onClick={() => removeRegNumber(num)}
                  className="hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Fetch button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFetch}
            disabled={loading || regNumbers.length === 0}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Fetching…" : "Get Labels"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {templates.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {templates.length} label{templates.length !== 1 ? "s" : ""} found
            </p>
            <button
              onClick={handlePrintAll}
              disabled={
                printingIds.size > 0 ||
                templates.every((t) => printedIds.has(t.vehicleId))
              }
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print All
            </button>
          </div>

          {/* Label cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => {
              const isPrinting = printingIds.has(template.vehicleId);
              const isPrinted = printedIds.has(template.vehicleId);
              const isExpanded = expandedIds.has(template.vehicleId);

              return (
                <div
                  key={template.vehicleId}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                    isPrinted ? "border-green-300" : "border-gray-200"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {template.registrationNumber}
                      </span>
                      {(isPrinted || template.isPrinted) && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Printed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(template.vehicleId)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <LabelField label="Owner" value={template.ownerName} />
                      <LabelField
                        label="Vehicle"
                        value={`${template.vehicleTypeName} / ${template.vehicleModelName}`}
                      />
                      <LabelField
                        label="Chassis"
                        value={template.chassisNumber}
                      />
                      <LabelField
                        label="Year"
                        value={template.registeredYear}
                      />
                      <div className="col-span-2">
                        <LabelField
                          label="EPC"
                          value={
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                              {template.epc}
                            </code>
                          }
                        />
                      </div>
                    </div>

                    {/* ZPL code collapsible */}
                    {isExpanded && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                          ZPL Code
                        </p>
                        <pre className="text-xs bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                          {template.zplCode}
                        </pre>
                      </div>
                    )}

                    {/* Print button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handlePrint(template)}
                        disabled={isPrinting || isPrinted}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                          isPrinted
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white"
                        }`}
                      >
                        {isPrinting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : isPrinted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                        {isPrinting
                          ? "Printing…"
                          : isPrinted
                            ? "Printed"
                            : "Print Label"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && regNumbers.length > 0 && (
        <div className="text-center py-16 text-gray-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            Click "Get Labels" to fetch print templates.
          </p>
        </div>
      )}
    </div>
  );
}

function LabelField({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-400 block">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? "—"}</span>
    </div>
  );
}
