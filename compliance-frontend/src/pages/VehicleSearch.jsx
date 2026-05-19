import React, { useState, useCallback, useRef } from "react";
import {
  Search,
  User,
  Car,
  FileText,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Info,
} from "lucide-react";
import { searchVehicles } from "../api/vehicleSearchApi";

/* ─── Document status badge ─────────────────────────────────── */
function DocStatusBadge({ endDate }) {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
        <AlertCircle className="w-3 h-3" /> Expired
      </span>
    );
  if (diffDays <= 30)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
        <Clock className="w-3 h-3" /> Expiring soon
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
      <CheckCircle2 className="w-3 h-3" /> Valid
    </span>
  );
}

/* ─── Helpers ───────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─── Vehicle Documents row ─────────────────────────────────── */
function DocumentRow({ doc }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-3.5 h-3.5 text-blue-900" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800">
            {doc.documentType?.name || "Unknown Document"}
          </p>
          <DocStatusBadge endDate={doc.endDate} />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Ref:{" "}
          <span className="font-medium text-gray-700">
            {doc.referenceNumber || "—"}
          </span>
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>
            {formatDate(doc.startDate)} → {formatDate(doc.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Vehicle section ───────────────────────────────────────── */
function VehicleSection({ vehicle }) {
  const [expanded, setExpanded] = useState(true);
  const docs = vehicle.documents || [];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Vehicle header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-blue-900" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {vehicle.vehicleNumber}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {vehicle.vehicleModel?.make?.name
                ? `${vehicle.vehicleModel.make.name} · ${vehicle.vehicleModel?.name || ""}`
                : vehicle.vehicleModel?.name || ""}
              {vehicle.vehicleType?.name
                ? ` · ${vehicle.vehicleType.name}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-white border border-gray-200 rounded-lg px-2 py-1">
              Reg:{" "}
              <span className="font-semibold text-gray-700">
                {vehicle.registrationNumber || "—"}
              </span>
            </span>
            <span className="bg-white border border-gray-200 rounded-lg px-2 py-1">
              Year:{" "}
              <span className="font-semibold text-gray-700">
                {vehicle.registeredYear || "—"}
              </span>
            </span>
            <span className="bg-white border border-gray-200 rounded-lg px-2 py-1">
              {docs.length} doc{docs.length !== 1 ? "s" : ""}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Vehicle details + documents */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Vehicle details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Vehicle No.", value: vehicle.vehicleNumber },
              { label: "Reg. Number", value: vehicle.registrationNumber },
              { label: "Chassis No.", value: vehicle.chassisNumber },
              { label: "Registered Year", value: vehicle.registeredYear },
              { label: "Make", value: vehicle.vehicleModel?.make?.name },
              { label: "Model", value: vehicle.vehicleModel?.name },
              { label: "Type", value: vehicle.vehicleType?.name },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {value}
                  </p>
                </div>
              ) : null,
            )}
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Documents ({docs.length})
            </p>
            {docs.length > 0 ? (
              <div className="space-y-2">
                {docs.map((doc, idx) => (
                  <DocumentRow key={doc.id ?? idx} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-3">
                <FileText className="w-4 h-4 shrink-0" />
                <span>No documents attached to this vehicle</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Owner result card ─────────────────────────────────────── */
function OwnerResultCard({ owner, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const vehicles = owner.vehicleDocumentResponseList || [];
  const initials =
    `${owner.firstName?.[0] || ""}${owner.lastName?.[0] || ""}`.toUpperCase();

  const totalDocs = vehicles.reduce(
    (s, v) => s + (v.documents?.length || 0),
    0,
  );
  const expiredDocs = vehicles.reduce(
    (s, v) =>
      s +
      (v.documents?.filter((d) => d.endDate && new Date(d.endDate) < new Date())
        .length || 0),
    0,
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Owner header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start sm:items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-blue-950 flex items-center justify-center text-white text-base font-bold shrink-0">
          {initials || <User className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              {owner.firstName} {owner.lastName}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-100">
              OWNER
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {owner.nic && (
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {owner.nic}
              </span>
            )}
            {owner.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {owner.email}
              </span>
            )}
            {owner.contactNumber && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {owner.contactNumber}
              </span>
            )}
          </div>
        </div>

        {/* Stats + toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="bg-blue-50 text-blue-900 rounded-lg px-2.5 py-1 font-semibold">
              {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
            </span>
            <span className="bg-emerald-50 text-emerald-700 rounded-lg px-2.5 py-1 font-semibold">
              {totalDocs} doc{totalDocs !== 1 ? "s" : ""}
            </span>
            {expiredDocs > 0 && (
              <span className="bg-red-50 text-red-700 rounded-lg px-2.5 py-1 font-semibold">
                {expiredDocs} expired
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded: vehicles */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          {vehicles.length > 0 ? (
            vehicles.map((v, idx) => (
              <VehicleSection key={v.id ?? idx} vehicle={v} />
            ))
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
              <Car className="w-4 h-4 shrink-0" />
              <span>No vehicles registered for this owner</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export function VehicleSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null); // null = not searched yet
  const [submittedQuery, setSubmittedQuery] = useState("");
  const inputRef = useRef(null);

  const doSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await searchVehicles(trimmed);
      if (!res.success) {
        setError(res.message || "Failed to search vehicles");
        return;
      }
      setResults(res.data || []);
      setSubmittedQuery(trimmed);
    } catch (e) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setError(null);
    setSubmittedQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Search</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search by vehicle number, registration number, owner name, or NIC
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Vehicle number, registration number, owner name, or NIC…"
              className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={doSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-950 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>

        {/* Search tip */}
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            You can search by owner&apos;s full name, NIC number, vehicle plate
            number, or vehicle registration number.
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            <span className="text-sm">Searching vehicles…</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        <div className="space-y-4">
          {/* Results summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {results.length > 0 ? (
                <>
                  Found{" "}
                  <span className="font-semibold text-gray-900">
                    {results.length}
                  </span>{" "}
                  result{results.length !== 1 ? "s" : ""} for &ldquo;
                  <span className="font-semibold text-blue-900">
                    {submittedQuery}
                  </span>
                  &rdquo;
                </>
              ) : (
                <>
                  No results found for &ldquo;
                  <span className="font-semibold text-gray-700">
                    {submittedQuery}
                  </span>
                  &rdquo;
                </>
              )}
            </p>
            {results.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Result cards */}
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((owner) => (
                <OwnerResultCard
                  key={owner.id}
                  owner={owner}
                  defaultExpanded={results.length === 1}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700">
                  No matches found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different vehicle number, registration number, name, or
                  NIC.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial empty state */}
      {!loading && results === null && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-16 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Car className="w-7 h-7 text-blue-900" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              Search for a vehicle
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Enter a vehicle number, registration number, owner name, or NIC to
              view owner and document details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
