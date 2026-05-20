import React, { useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  X,
  AlertTriangle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const SCOPES = [
  { id: "detections:read", label: "Read Detections", group: "Detections" },
  { id: "vehicles:read", label: "Read Vehicles", group: "Vehicles" },
  { id: "vehicles:update", label: "Update Vehicles", group: "Vehicles" },
  { id: "owners:read", label: "Read Owners", group: "Owners" },
  {
    id: "scan_centers:read",
    label: "Read Scan Centers",
    group: "Scan Centers",
  },
  { id: "statistics:read", label: "Read Statistics", group: "Statistics" },
  { id: "documents:create", label: "Create Documents", group: "Documents" },
  { id: "documents:update", label: "Update Documents", group: "Documents" },
  { id: "users:create", label: "Create Users", group: "Users" },
  { id: "users:update", label: "Update Users", group: "Users" },
];

const generateToken = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const segment = (len) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  return `rfid_${segment(8)}.${segment(16)}.${segment(32)}`;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const isExpired = (expiry) => expiry && new Date(expiry) < new Date();

// ─── seed demo data ──────────────────────────────────────────────────────────
const DEMO_TOKENS = [
  {
    id: "tok_1",
    name: "Detection Monitor Integration",
    description:
      "Used by the external monitoring dashboard to pull detections.",
    scopes: ["detections:read", "statistics:read"],
    createdAt: "2026-03-10T08:00:00Z",
    expiresAt: "2027-03-10T08:00:00Z",
    status: "active",
    maskedToken: "rfid_Ab3dEf8g.****************",
  },
  {
    id: "tok_2",
    name: "Vehicle Registry Sync",
    description:
      "Syncs vehicle and owner records with the provincial registry.",
    scopes: ["vehicles:read", "owners:read"],
    createdAt: "2026-01-15T10:30:00Z",
    expiresAt: "2026-05-01T00:00:00Z", // already expired
    status: "active",
    maskedToken: "rfid_Zx9wQr2m.****************",
  },
  {
    id: "tok_3",
    name: "Compliance Audit Tool",
    description: "Read-only access granted to the annual audit team.",
    scopes: ["detections:read", "vehicles:read", "scan_centers:read"],
    createdAt: "2025-11-20T14:00:00Z",
    expiresAt: null,
    status: "revoked",
    maskedToken: "rfid_Lm5nKo1p.****************",
  },
  {
    id: "tok_4",
    name: "Document Management Service",
    description:
      "Allows the document management microservice to create and update documents.",
    scopes: ["documents:create", "documents:update"],
    createdAt: "2026-04-01T09:15:00Z",
    expiresAt: null,
    status: "active",
    maskedToken: "rfid_Pq7rSt4v.****************",
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function ScopeBadge({ scope }) {
  const def = SCOPES.find((s) => s.id === scope);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium">
      {def?.label ?? scope}
    </span>
  );
}

function StatusBadge({ token }) {
  if (token.status === "revoked") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <XCircle className="w-3.5 h-3.5" />
        Revoked
      </span>
    );
  }
  if (isExpired(token.expiresAt)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
        <AlertTriangle className="w-3.5 h-3.5" />
        Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Active
    </span>
  );
}

// ─── Create Token Modal ───────────────────────────────────────────────────────

function CreateTokenModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [errors, setErrors] = useState({});

  const toggleScope = (id) =>
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Token name is required.";
    if (selectedScopes.length === 0)
      e.scopes = "Select at least one permission scope.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);

    const token = generateToken();
    onCreate({
      id: `tok_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      scopes: selectedScopes,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      status: "active",
      maskedToken: token.slice(0, 22) + "****************",
      plainToken: token,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">
              Create API Token
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="e.g. Detection Monitor Integration"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note about what this token is used for…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Scopes <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedScopes.includes(scope.id) ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.id)}
                    onChange={() => {
                      toggleScope(scope.id);
                      setErrors((p) => ({ ...p, scopes: undefined }));
                    }}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {scope.label}
                    </p>
                    <p className="text-xs text-gray-400">{scope.id}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.scopes && (
              <p className="text-xs text-red-500 mt-1">{errors.scopes}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors"
          >
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Token Reveal Modal ────────────────────────────────────────────────────────

function TokenRevealModal({ token, onClose }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token.plainToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="text-base font-semibold">Token Created</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Copy this token now. For security reasons,{" "}
              <strong>it will not be shown again</strong> after you close this
              dialog.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Your API Token
            </label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <code className="flex-1 text-xs text-gray-800 font-mono break-all select-all">
                {visible
                  ? token.plainToken
                  : "•".repeat(token.plainToken.length)}
              </code>
              <button
                onClick={() => setVisible((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                title={visible ? "Hide token" : "Show token"}
              >
                {visible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                Name
              </p>
              <p className="text-gray-800 font-medium">{token.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                Expires
              </p>
              <p className="text-gray-800">
                {token.expiresAt ? formatDate(token.expiresAt) : "Never"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
              Scopes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {token.scopes.map((s) => (
                <ScopeBadge key={s} scope={s} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-700"}`}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Token"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Revoke Confirm Modal ─────────────────────────────────────────────────────

function RevokeConfirmModal({ token, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Revoke Token?
          </h2>
          <p className="text-sm text-gray-500">
            Revoking{" "}
            <span className="font-semibold text-gray-800">{token.name}</span>{" "}
            will immediately invalidate all API requests using it. This cannot
            be undone.
          </p>
        </div>
        <div className="flex justify-center gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Revoke Token
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ApiTokens() {
  const [tokens, setTokens] = useState(DEMO_TOKENS);
  const [showCreate, setShowCreate] = useState(false);
  const [revealToken, setRevealToken] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCreate = (newToken) => {
    setTokens((prev) => [newToken, ...prev]);
    setShowCreate(false);
    setRevealToken(newToken);
  };

  const handleRevoke = () => {
    setTokens((prev) =>
      prev.map((t) =>
        t.id === revokeTarget.id ? { ...t, status: "revoked" } : t,
      ),
    );
    setRevokeTarget(null);
  };

  const handleCopyMasked = (token) => {
    navigator.clipboard.writeText(token.maskedToken).then(() => {
      setCopiedId(token.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const activeCount = tokens.filter(
    (t) => t.status === "active" && !isExpired(t.expiresAt),
  ).length;
  const revokedCount = tokens.filter((t) => t.status === "revoked").length;
  const expiredCount = tokens.filter(
    (t) => t.status !== "revoked" && isExpired(t.expiresAt),
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-gray-700" />
            External API Tokens
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage long-lived tokens that allow external systems to access the
            RFID Compliance backend APIs.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Token
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Active
            </p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Expired
            </p>
            <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Revoked
            </p>
            <p className="text-2xl font-bold text-gray-900">{revokedCount}</p>
          </div>
        </div>
      </div>

      {/* Usage Note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <KeyRound className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Include your token in the{" "}
          <code className="font-mono bg-blue-100 px-1 rounded">
            Authorization
          </code>{" "}
          header of each API request:{" "}
          <code className="font-mono bg-blue-100 px-1 rounded">
            Authorization: Bearer &lt;token&gt;
          </code>
        </p>
      </div>

      {/* Token Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">
            All Tokens{" "}
            <span className="text-gray-400 font-normal">({tokens.length})</span>
          </h2>
        </div>

        {tokens.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <KeyRound className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No tokens created yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                {/* Left: name + description + token */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {token.name}
                    </p>
                    <StatusBadge token={token} />
                  </div>
                  {token.description && (
                    <p className="text-xs text-gray-500">{token.description}</p>
                  )}
                  {/* Masked token with copy */}
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 select-all">
                      {token.maskedToken}
                    </code>
                    <button
                      onClick={() => handleCopyMasked(token)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                      title="Copy masked token reference"
                    >
                      {copiedId === token.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Middle: scopes */}
                <div className="flex flex-wrap gap-1.5 sm:max-w-[260px]">
                  {token.scopes.map((s) => (
                    <ScopeBadge key={s} scope={s} />
                  ))}
                </div>

                {/* Right: dates + actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right text-xs text-gray-400 space-y-0.5">
                    <p>
                      Created:{" "}
                      <span className="text-gray-600">
                        {formatDate(token.createdAt)}
                      </span>
                    </p>
                    <p>
                      Expires:{" "}
                      <span
                        className={
                          isExpired(token.expiresAt)
                            ? "text-red-500 font-semibold"
                            : "text-gray-600"
                        }
                      >
                        {token.expiresAt
                          ? formatDate(token.expiresAt)
                          : "Never"}
                      </span>
                    </p>
                  </div>
                  {token.status !== "revoked" && (
                    <button
                      onClick={() => setRevokeTarget(token)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTokenModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {revealToken && (
        <TokenRevealModal
          token={revealToken}
          onClose={() => setRevealToken(null)}
        />
      )}
      {revokeTarget && (
        <RevokeConfirmModal
          token={revokeTarget}
          onConfirm={handleRevoke}
          onClose={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}
