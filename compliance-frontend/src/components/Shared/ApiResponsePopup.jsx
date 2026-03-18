import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function ApiResponsePopup({
  open,
  type = "success",
  title,
  message,
  buttonLabel = "OK",
  cancelLabel = "Cancel",
  showCancel = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const isSuccess = type === "success";
  const isWarning = type === "warning";

  const iconWrapClass = isSuccess
    ? "bg-emerald-50"
    : isWarning
      ? "bg-amber-50"
      : "bg-red-50";

  const icon = isSuccess ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  ) : isWarning ? (
    <AlertCircle className="h-5 w-5 text-amber-600" />
  ) : (
    <AlertCircle className="h-5 w-5 text-red-600" />
  );

  const confirmButtonClass = isSuccess
    ? "bg-emerald-600 hover:bg-emerald-700"
    : isWarning
      ? "bg-amber-600 hover:bg-amber-700"
      : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center ${iconWrapClass}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {title || (isSuccess ? "Success" : "Something went wrong")}
              </h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                {message || "No details provided."}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 flex justify-end">
          {showCancel ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm || onClose}
                className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${confirmButtonClass}`}
              >
                {buttonLabel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${confirmButtonClass}`}
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
