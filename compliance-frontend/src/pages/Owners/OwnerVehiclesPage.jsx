import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Car,
  FileText,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getUserById,
  addVehicleToOwner,
  updateVehicleForOwner,
  removeVehicleFromOwner,
} from "../../api/usersApi";
import { getVehicleTypes } from "../../api/vehicleTypesApi";
import { getVehicleMakes } from "../../api/vehicleMakesApi";
import { getVehicleModelsByMakeId } from "../../api/vehicleModelsApi";
import { getDocumentTypes } from "../../api/documentTypesApi";

/* ─── helpers ──────────────────────────────────────────────── */
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : "");

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white";
const inputErrorClass =
  "w-full border border-red-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

function FieldErr({ name }) {
  return (
    <ErrorMessage
      name={name}
      render={(msg) => <p className="mt-1 text-xs text-red-500">{msg}</p>}
    />
  );
}

const vehicleSchema = Yup.object({
  vehicleTypeId: Yup.string().required("Vehicle type is required"),
  makeId: Yup.string().required("Make is required"),
  vehicleModelId: Yup.string().required("Model is required"),
  registrationNumber: Yup.string().required("Registration number is required"),
  vehicleNumber: Yup.string().required("Vehicle number is required"),
  chassisNumber: Yup.string().required("Chassis number is required"),
  registeredYear: Yup.string()
    .required("Registered year is required")
    .matches(/^\d{4}$/, "Must be a 4-digit year"),
  documentRequests: Yup.array().of(
    Yup.object({
      documentTypeId: Yup.string().required("Document type required"),
      referenceNumber: Yup.string().required("Reference number required"),
      startDate: Yup.string().required("Start date required"),
      endDate: Yup.string().required("End date required"),
    }),
  ),
});

const EMPTY_VEHICLE = {
  vehicleTypeId: "",
  makeId: "",
  vehicleModelId: "",
  registrationNumber: "",
  vehicleNumber: "",
  chassisNumber: "",
  registeredYear: "",
  documentRequests: [
    { documentTypeId: "", referenceNumber: "", startDate: "", endDate: "" },
  ],
};

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

/* ─── Owner Profile Card ────────────────────────────────────── */
function OwnerProfileCard({ owner, vehicles = [] }) {
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

  const stats = [
    {
      label: "Vehicles",
      value: vehicles.length,
      color: "text-blue-900",
      bg: "bg-blue-50",
    },
    {
      label: "Documents",
      value: totalDocs,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Expired",
      value: expiredDocs,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="flex items-center gap-6 flex-1 min-w-0">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-blue-950 flex items-center justify-center text-white text-lg font-bold shrink-0">
        {initials || <User className="w-6 h-6" />}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-gray-900">
            {owner.firstName} {owner.lastName}
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-100">
            {owner.role?.name || "OWNER"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">@{owner.username}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
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
          {owner.nic && (
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {owner.nic}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-gray-200 shrink-0 hidden sm:block" />

      {/* Stats */}
      <div className="flex items-center gap-3 shrink-0">
        {stats.map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`flex flex-col w-36 items-center px-4 py-2 rounded-xl ${bg}`}
          >
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className={`text-xs font-medium mt-0.5 ${color} opacity-80`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Vehicle Card ──────────────────────────────────────────── */
function VehicleCard({ vehicle, selected, onSelect, onEdit, onDelete }) {
  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={`rounded-xl border cursor-pointer transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selected ? "bg-blue-900" : "bg-gray-100"
              }`}
            >
              <Car
                className={`w-4 h-4 ${selected ? "text-white" : "text-gray-500"}`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {vehicle.vehicleNumber}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {vehicle.vehicleModel?.make?.name} {vehicle.vehicleModel?.name}
              </p>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(vehicle);
                  }}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(vehicle);
                  }}
                  className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remove Vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
            <p className="text-gray-400 font-medium">Reg. No.</p>
            <p className="text-gray-700 font-semibold truncate mt-0.5">
              {vehicle.registrationNumber}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
            <p className="text-gray-400 font-medium">Year</p>
            <p className="text-gray-700 font-semibold mt-0.5">
              {vehicle.registeredYear}
            </p>
          </div>
        </div>

        {/* <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 mb-1.5">
            Documents
          </p>

          {vehicle.documents?.length > 0 ? (
            <div className="space-y-1.5">
              {vehicle.documents.map((doc, index) => (
                <div
                  key={doc.id || `${doc.documentType?.id || "doc"}-${index}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2"
                >
                  <p className="text-xs font-semibold text-gray-700">
                    {doc.documentType?.name || "Unknown document"}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {doc.startDate
                        ? new Date(doc.startDate).toLocaleDateString()
                        : "-"}{" "}
                      &rarr;{" "}
                      {doc.endDate
                        ? new Date(doc.endDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FileText className="w-3.5 h-3.5" />
              <span>No documents attached</span>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

/* ─── Vehicle Detail Panel ──────────────────────────────────── */
function VehicleDetailPanel({ vehicle }) {
  return (
    <div className="h-full flex flex-col">
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {vehicle.vehicleNumber}
            </h3>
            <p className="text-xs text-gray-500">
              {vehicle.vehicleModel?.make?.name} &bull;{" "}
              {vehicle.vehicleModel?.name} &bull; {vehicle.vehicleType?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Registration Number", value: vehicle.registrationNumber },
          { label: "Vehicle Number", value: vehicle.vehicleNumber },
          { label: "Chassis Number", value: vehicle.chassisNumber },
          { label: "Registered Year", value: vehicle.registeredYear },
          {
            label: "Make",
            value: vehicle.vehicleModel?.make?.name,
          },
          { label: "Model", value: vehicle.vehicleModel?.name },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {value || "-"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Documents
        </p>
        {vehicle.documents?.length > 0 ? (
          <div className="space-y-2.5">
            {vehicle.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">
                      {doc.documentType?.name}
                    </p>
                    <DocStatusBadge endDate={doc.endDate} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ref: {doc.referenceNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {doc.startDate
                        ? new Date(doc.startDate).toLocaleDateString()
                        : "-"}{" "}
                      &rarr;{" "}
                      {doc.endDate
                        ? new Date(doc.endDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mb-2 text-gray-200" />
            <p className="text-sm">No documents attached</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Vehicle Form Panel ────────────────────────────────────── */
function VehicleFormPanel({
  owner,
  editingVehicle,
  vehicleTypes,
  makes,
  documentTypes,
  onSuccess,
  onCancel,
}) {
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadModels = async (makeId) => {
    if (!makeId) {
      setModels([]);
      return;
    }
    setModelsLoading(true);
    const res = await getVehicleModelsByMakeId(makeId);
    setModels(Array.isArray(res?.data) ? res.data : []);
    setModelsLoading(false);
  };

  useEffect(() => {
    if (editingVehicle?.vehicleModel?.make?.id) {
      loadModels(editingVehicle.vehicleModel.make.id);
    } else {
      setModels([]);
    }
  }, [editingVehicle?.id]);

  const initialValues = editingVehicle
    ? {
        vehicleTypeId: String(editingVehicle.vehicleType?.id || ""),
        makeId: String(editingVehicle.vehicleModel?.make?.id || ""),
        vehicleModelId: String(editingVehicle.vehicleModel?.id || ""),
        registrationNumber: editingVehicle.registrationNumber || "",
        vehicleNumber: editingVehicle.vehicleNumber || "",
        chassisNumber: editingVehicle.chassisNumber || "",
        registeredYear: String(editingVehicle.registeredYear || ""),
        documentRequests:
          editingVehicle.documents?.length > 0
            ? editingVehicle.documents.map((d) => ({
                documentTypeId: String(d.documentType?.id || ""),
                referenceNumber: d.referenceNumber || "",
                startDate: toDateInput(d.startDate),
                endDate: toDateInput(d.endDate),
              }))
            : [
                {
                  documentTypeId: "",
                  referenceNumber: "",
                  startDate: "",
                  endDate: "",
                },
              ],
      }
    : EMPTY_VEHICLE;

  return (
    <div className="h-full flex flex-col">
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {editingVehicle
              ? `Editing ${editingVehicle.vehicleNumber}`
              : `Registering vehicle for ${owner.firstName} ${owner.lastName}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={vehicleSchema}
          onSubmit={async (values, { resetForm }) => {
            setSubmitError(null);
            const payload = {
              vehicleTypeId: Number(values.vehicleTypeId),
              vehicleModelId: Number(values.vehicleModelId),
              registrationNumber: values.registrationNumber,
              vehicleNumber: values.vehicleNumber,
              chassisNumber: values.chassisNumber,
              registeredYear: values.registeredYear,
              ownerId: owner ? owner.id : null,
              documentRequests: values.documentRequests.map((d) => ({
                documentTypeId: Number(d.documentTypeId),
                referenceNumber: d.referenceNumber,
                startDate: d.startDate
                  ? `${d.startDate}T00:00:00Z`
                  : d.startDate,
                endDate: d.endDate ? `${d.endDate}T00:00:00Z` : d.endDate,
              })),
            };
            const res = editingVehicle
              ? await updateVehicleForOwner(editingVehicle.id, payload)
              : await addVehicleToOwner(owner.id, payload);
            if (res.success) {
              if (!editingVehicle) resetForm();
              onSuccess();
            } else {
              setSubmitError(
                res.message ||
                  `Failed to ${editingVehicle ? "update" : "add"} vehicle.`,
              );
            }
          }}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4 pb-4">
              {/* Vehicle Type */}
              <div>
                <label className={labelClass}>
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  name="vehicleTypeId"
                  className={
                    errors.vehicleTypeId && touched.vehicleTypeId
                      ? inputErrorClass
                      : inputClass
                  }
                >
                  <option value="">Select type...</option>
                  {vehicleTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Field>
                <FieldErr name="vehicleTypeId" />
              </div>

              {/* Make + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Make <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="makeId"
                    className={
                      errors.makeId && touched.makeId
                        ? inputErrorClass
                        : inputClass
                    }
                    onChange={(e) => {
                      setFieldValue("makeId", e.target.value);
                      setFieldValue("vehicleModelId", "");
                      loadModels(e.target.value);
                    }}
                  >
                    <option value="">Select make...</option>
                    {makes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Field>
                  <FieldErr name="makeId" />
                </div>
                <div>
                  <label className={labelClass}>
                    Model <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="vehicleModelId"
                    disabled={!values.makeId || modelsLoading}
                    className={
                      errors.vehicleModelId && touched.vehicleModelId
                        ? inputErrorClass
                        : inputClass
                    }
                  >
                    <option value="">
                      {modelsLoading
                        ? "Loading..."
                        : values.makeId
                          ? "Select model..."
                          : "Select make first"}
                    </option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Field>
                  <FieldErr name="vehicleModelId" />
                </div>
              </div>

              {/* Registration / Vehicle Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Registration No. <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="registrationNumber"
                    placeholder="CAA-1234"
                    className={
                      errors.registrationNumber && touched.registrationNumber
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldErr name="registrationNumber" />
                </div>
                <div>
                  <label className={labelClass}>
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="vehicleNumber"
                    placeholder="WP CAA-1234"
                    className={
                      errors.vehicleNumber && touched.vehicleNumber
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldErr name="vehicleNumber" />
                </div>
              </div>

              {/* Chassis + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Chassis Number <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="chassisNumber"
                    placeholder="JTDBR32E500000001"
                    className={
                      errors.chassisNumber && touched.chassisNumber
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldErr name="chassisNumber" />
                </div>
                <div>
                  <label className={labelClass}>
                    Registered Year <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="registeredYear"
                    placeholder="2024"
                    maxLength={4}
                    className={
                      errors.registeredYear && touched.registeredYear
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldErr name="registeredYear" />
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Documents
                </p>
                <FieldArray name="documentRequests">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.documentRequests.map((_, i) => (
                        <div
                          key={i}
                          className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              Document {i + 1}
                            </p>
                            {values.documentRequests.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(i)}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className={labelClass}>
                              Type <span className="text-red-500">*</span>
                            </label>
                            <Field
                              as="select"
                              name={`documentRequests[${i}].documentTypeId`}
                              className={
                                errors.documentRequests?.[i]?.documentTypeId &&
                                touched.documentRequests?.[i]?.documentTypeId
                                  ? inputErrorClass
                                  : inputClass
                              }
                            >
                              <option value="">Select type...</option>
                              {documentTypes.map((dt) => (
                                <option key={dt.id} value={dt.id}>
                                  {dt.name}
                                </option>
                              ))}
                            </Field>
                            <FieldErr
                              name={`documentRequests[${i}].documentTypeId`}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Reference Number{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Field
                              name={`documentRequests[${i}].referenceNumber`}
                              placeholder="INS-CAA-1234-2024"
                              className={
                                errors.documentRequests?.[i]?.referenceNumber &&
                                touched.documentRequests?.[i]?.referenceNumber
                                  ? inputErrorClass
                                  : inputClass
                              }
                            />
                            <FieldErr
                              name={`documentRequests[${i}].referenceNumber`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>
                                Start Date{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Field
                                name={`documentRequests[${i}].startDate`}
                                type="date"
                                className={
                                  errors.documentRequests?.[i]?.startDate &&
                                  touched.documentRequests?.[i]?.startDate
                                    ? inputErrorClass
                                    : inputClass
                                }
                              />
                              <FieldErr
                                name={`documentRequests[${i}].startDate`}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                End Date <span className="text-red-500">*</span>
                              </label>
                              <Field
                                name={`documentRequests[${i}].endDate`}
                                type="date"
                                className={
                                  errors.documentRequests?.[i]?.endDate &&
                                  touched.documentRequests?.[i]?.endDate
                                    ? inputErrorClass
                                    : inputClass
                                }
                              />
                              <FieldErr
                                name={`documentRequests[${i}].endDate`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          push({
                            documentTypeId: "",
                            referenceNumber: "",
                            startDate: "",
                            endDate: "",
                          })
                        }
                        className="flex items-center gap-2 text-xs text-blue-900 hover:text-gray-800 font-medium px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors w-full justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Document
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-950 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingVehicle
                      ? "Update Vehicle"
                      : "Add Vehicle"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export function OwnerVehiclesPage({ owner, onBack, readOnly = false }) {
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | "add" | "edit"
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [makes, setMakes] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  const loadOwner = async () => {
    setLoading(true);
    setFetchError(null);
    const res = await getUserById(owner.id);
    if (res.success && res.data) {
      setOwnerData(res.data);
    } else {
      setFetchError(res.message || "Failed to load owner details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOwner();
    Promise.all([
      getVehicleTypes(),
      getVehicleMakes(),
      getDocumentTypes(),
    ]).then(([vt, vm, dt]) => {
      setVehicleTypes(Array.isArray(vt?.data) ? vt.data : []);
      setMakes(Array.isArray(vm?.data) ? vm.data : []);
      setDocumentTypes(Array.isArray(dt?.data) ? dt.data : []);
    });
  }, [owner.id]);

  const vehicles = ownerData?.vehicleDocumentResponseList || [];

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormMode("edit");
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = (vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteError(null);
  };

  const confirmDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const res = await removeVehicleFromOwner(owner.id, deletingVehicle.id);
    setDeleteLoading(false);
    if (res.success) {
      setDeletingVehicle(null);
      if (selectedVehicle?.id === deletingVehicle.id) setSelectedVehicle(null);
      if (editingVehicle?.id === deletingVehicle.id) {
        setFormMode(null);
        setEditingVehicle(null);
      }
      loadOwner();
    } else {
      setDeleteError(res.message || "Failed to remove vehicle.");
    }
  };

  const handleFormSuccess = () => {
    loadOwner().then(() => {
      setFormMode(null);
      setEditingVehicle(null);
    });
  };

  const handleFormCancel = () => {
    setFormMode(null);
    setEditingVehicle(null);
  };

  const rightPanelContent = () => {
    if (!readOnly && (formMode === "add" || formMode === "edit")) {
      return (
        <VehicleFormPanel
          owner={owner}
          editingVehicle={editingVehicle}
          vehicleTypes={vehicleTypes}
          makes={makes}
          documentTypes={documentTypes}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      );
    }
    if (selectedVehicle) {
      return <VehicleDetailPanel vehicle={selectedVehicle} />;
    }
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <Car className="w-14 h-14 text-gray-200 mb-3" />
        <p className="text-sm font-medium">Select a vehicle to view details</p>
        <p className="text-xs mt-1">
          or add a new vehicle using the button above
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {readOnly ? "Dashboard" : "Owners"}
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="text-sm text-gray-800 font-semibold">
          {readOnly ? "My Vehicles" : `${owner.firstName} ${owner.lastName}`}
        </span>
      </div>

      {/* Main content: left vehicle list + right detail/form panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          {/* Owner profile card with stats */}
          <OwnerProfileCard owner={owner} vehicles={vehicles} />
          {!readOnly && (
            <button
              onClick={() => {
                setEditingVehicle(null);
                setSelectedVehicle(null);
                setFormMode("add");
              }}
              className="flex items-center gap-2 bg-blue-950 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          )}
        </div>

        {/* Split panel */}
        <div
          className="flex divide-x divide-gray-100"
          style={{ minHeight: "520px" }}
        >
          {/* Left: vehicle list */}
          <div
            className="w-80 shrink-0 p-4 overflow-y-auto"
            style={{ maxHeight: "700px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                Loading vehicles...
              </div>
            ) : fetchError ? (
              <div className="flex items-center justify-center py-16 text-sm text-red-500 text-center px-4">
                {fetchError}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Car className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-sm">No vehicles yet</p>
                <p className="text-xs mt-1">
                  Click "Add Vehicle" to register one
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-sm font-bold text-gray-800 p-1">
                  Vehicles
                  {vehicles.length > 0 && (
                    <span className="ml-2 text-xs font-semibold text-blue-900 bg-blue-50 rounded-full px-2 py-0.5">
                      {vehicles.length}
                    </span>
                  )}
                </p>
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    selected={selectedVehicle?.id === v.id && formMode === null}
                    onSelect={(vehicle) => {
                      setSelectedVehicle(vehicle);
                      setFormMode(null);
                      setEditingVehicle(null);
                    }}
                    onEdit={readOnly ? null : handleEditVehicle}
                    onDelete={readOnly ? null : handleDeleteVehicle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: detail / form panel */}
          <div
            className="flex-1 p-5 overflow-y-auto"
            style={{ maxHeight: "700px" }}
          >
            {rightPanelContent()}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Remove Vehicle
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                {deletingVehicle.vehicleNumber}
              </span>{" "}
              from this owner?
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingVehicle(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteVehicle}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleteLoading ? "Removing..." : "Remove Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
