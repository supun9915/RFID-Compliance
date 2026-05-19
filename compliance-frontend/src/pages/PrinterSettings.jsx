import React, { useState, useEffect } from "react";
import {
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Trash2,
  FlaskConical,
  Save,
} from "lucide-react";
import {
  getAvailablePrinters,
  getSelectedPrinter,
  saveSelectedPrinter,
  clearSelectedPrinter,
  getBrowserPrintUrl,
  saveBrowserPrintUrl,
  printZpl,
} from "../utils/zebraPrint";
import { notifyResponse } from "../utils/responseNotifier";

const TEST_ZPL = `^XA
^MMT
^PW609
^LL0203
^LS0
^FO20,30^A0N,40,40^FDTest Print^FS
^FO20,80^A0N,28,28^FDZebra Browser Print^FS
^FO20,115^A0N,22,22^FDAutoComply RFID System^FS
^XZ`;

export function PrinterSettings() {
  const [serviceUrl, setServiceUrl] = useState(getBrowserPrintUrl());
  const [urlDraft, setUrlDraft] = useState(getBrowserPrintUrl());
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(getSelectedPrinter());
  const [connected, setConnected] = useState(null); // null = unknown, true/false
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState(null);

  // Auto-refresh printers on mount
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const result = await getAvailablePrinters();
    setLoading(false);
    setConnected(result.success);
    setPrinters(result.printers);
    if (!result.success) {
      notifyResponse({
        type: "error",
        title: "Browser Print Unavailable",
        message: result.error,
      });
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlDraft.trim().replace(/\/$/, "");
    saveBrowserPrintUrl(trimmed);
    setServiceUrl(trimmed);
    notifyResponse({
      type: "success",
      title: "Saved",
      message: "Browser Print service URL updated.",
    });
    handleRefresh();
  };

  const handleSelectPrinter = (printer) => {
    saveSelectedPrinter(printer);
    setSelectedPrinter(printer);
    notifyResponse({
      type: "success",
      title: "Printer Selected",
      message: `${printer.name} is now the default printer.`,
    });
  };

  const handleClearPrinter = () => {
    clearSelectedPrinter();
    setSelectedPrinter(null);
    notifyResponse({
      type: "success",
      title: "Cleared",
      message: "Default printer has been removed.",
    });
  };

  const handleTestPrint = async (printer) => {
    setTestingId(printer.uid || printer.name);
    const result = await printZpl(printer, TEST_ZPL);
    setTestingId(null);
    if (result.success) {
      notifyResponse({
        type: "success",
        title: "Test Print Sent",
        message: `Test label sent to ${printer.name}.`,
      });
    } else {
      notifyResponse({
        type: "error",
        title: "Test Print Failed",
        message: result.error,
      });
    }
  };

  const isCurrent = (printer) =>
    selectedPrinter &&
    (selectedPrinter.uid
      ? selectedPrinter.uid === printer.uid
      : selectedPrinter.name === printer.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Printer Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your Zebra RFID label printer using Zebra Browser Print.
        </p>
      </div>

      {/* Connection status */}
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
          connected === null
            ? "bg-gray-50 border-gray-200"
            : connected
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            connected === null
              ? "bg-gray-200"
              : connected
                ? "bg-green-100"
                : "bg-red-100"
          }`}
        >
          {connected ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold ${
              connected === null
                ? "text-gray-700"
                : connected
                  ? "text-green-800"
                  : "text-red-800"
            }`}
          >
            {connected === null
              ? "Checking connection…"
              : connected
                ? "Browser Print Connected"
                : "Browser Print Unavailable"}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              connected === null
                ? "text-gray-500"
                : connected
                  ? "text-green-600"
                  : "text-red-600"
            }`}
          >
            {connected
              ? `${printers.length} printer${printers.length !== 1 ? "s" : ""} detected at ${serviceUrl}`
              : connected === false
                ? "Install Zebra Browser Print and ensure it is running, then refresh."
                : ""}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: config & instructions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Service URL */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Service URL
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="http://localhost:9100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                onClick={handleSaveUrl}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save &amp; Reconnect
              </button>
            </div>
          </div>

          {/* Setup instructions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Setup Instructions
            </h3>
            <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
              <li>
                Download <strong>Zebra Browser Print</strong> from zebra.com.
              </li>
              <li>Install and launch the Browser Print application.</li>
              <li>Connect your Zebra RFID printer via USB or network.</li>
              <li>
                Click <strong>Refresh</strong> to detect printers.
              </li>
              <li>
                Click <strong>Set as Default</strong> to assign a printer.
              </li>
            </ol>
          </div>
        </div>

        {/* Right column: printer list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Available Printers
              </h3>
              {selectedPrinter && (
                <button
                  onClick={handleClearPrinter}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Default
                </button>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Scanning for printers…</span>
              </div>
            )}

            {!loading && printers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                {connected === false ? (
                  <>
                    <WifiOff className="w-8 h-8 mb-3 opacity-40" />
                    <p className="text-sm">No connection to Browser Print.</p>
                    <p className="text-xs mt-1">
                      Make sure the application is installed and running.
                    </p>
                  </>
                ) : (
                  <>
                    <Printer className="w-8 h-8 mb-3 opacity-40" />
                    <p className="text-sm">No printers detected.</p>
                    <p className="text-xs mt-1">
                      Connect a Zebra printer and click Refresh.
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && printers.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {printers.map((printer, index) => {
                  const key = printer.uid || printer.name || index;
                  const current = isCurrent(printer);
                  const isTesting = testingId === (printer.uid || printer.name);

                  return (
                    <li
                      key={key}
                      className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${
                        current ? "bg-green-50 hover:bg-green-50" : ""
                      }`}
                    >
                      {/* Printer info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            current ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          <Printer
                            className={`w-4 h-4 ${current ? "text-green-600" : "text-gray-500"}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {printer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {printer.connection}
                            {printer.uid
                              ? ` · ${printer.uid.slice(0, 32)}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {current && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Default
                          </span>
                        )}

                        <button
                          onClick={() => handleTestPrint(printer)}
                          disabled={isTesting}
                          className="flex items-center gap-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          {isTesting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FlaskConical className="w-3.5 h-3.5" />
                          )}
                          {isTesting ? "Sending…" : "Test"}
                        </button>

                        {!current && (
                          <button
                            onClick={() => handleSelectPrinter(printer)}
                            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Set Default
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Default printer summary */}
          {selectedPrinter && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Current Default Printer
              </p>
              <p className="text-sm text-green-700 mt-1">
                {selectedPrinter.name}
              </p>
              <p className="text-xs text-green-600">
                Connection: {selectedPrinter.connection}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
