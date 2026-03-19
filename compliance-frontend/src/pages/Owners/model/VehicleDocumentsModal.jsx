import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Car,
  FileText,
  Trash2,
  Edit2,
} from "lucide-react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getUserById,
  addVehicleToOwner,
  updateVehicleForOwner,
} from "../../../api/usersApi";
import { getVehicleTypes } from "../../../api/vehicleTypesApi";
import { getVehicleMakes } from "../../../api/vehicleMakesApi";
import { getVehicleModelsByMakeId } from "../../../api/vehicleModelsApi";
import { getDocumentTypes } from "../../../api/documentTypesApi";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white";
const inputErrorClass =
  "w-full border border-red-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1";
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : "");

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

function VehicleCard({ vehicle, onEdit }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <Car className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {vehicle.vehicleNumber}
            </p>
            <p className="text-xs text-gray-500">
              {vehicle.vehicleModel?.make?.name} {vehicle.vehicleModel?.name}{" "}
              &bull; {vehicle.registrationNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
            }}
            className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            title="Edit Vehicle"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          </button>
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      {open && (
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium text-gray-700">Type: </span>
              {vehicle.vehicleType?.name || "-"}
            </div>
            <div>
              <span className="font-medium text-gray-700">Chassis: </span>
              {vehicle.chassisNumber || "-"}
            </div>
            <div>
              <span className="font-medium text-gray-700">Year: </span>
              {vehicle.registeredYear || "-"}
            </div>
          </div>
          {vehicle.documents && vehicle.documents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Documents
              </p>
              {vehicle.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <FileText className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p className="font-semibold text-gray-800">
                      {doc.documentType?.name}
                    </p>
                    <p>Ref: {doc.referenceNumber}</p>
                    <p>
                      {doc.startDate
                        ? new Date(doc.startDate).toLocaleDateString()
                        : "-"}{" "}
                      &rarr;{" "}
                      {doc.endDate
                        ? new Date(doc.endDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No documents attached.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function VehicleForm({
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
          documentRequests: values.documentRequests.map((d) => ({
            documentTypeId: Number(d.documentTypeId),
            referenceNumber: d.referenceNumber,
            startDate: d.startDate ? `${d.startDate}T00:00:00Z` : null,
            endDate: d.endDate ? `${d.endDate}T00:00:00Z` : null,
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
        <Form className="space-y-4">
          {/* Vehicle Type & Make */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className={labelClass}>
                Make <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="makeId"
                className={
                  errors.makeId && touched.makeId ? inputErrorClass : inputClass
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
          </div>

          {/* Model */}
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

          {/* Registration / Vehicle Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Registration Number <span className="text-red-500">*</span>
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

          {/* Chassis Number / Registered Year */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Documents
              </p>
            </div>
            <FieldArray name="documentRequests">
              {({ push, remove }) => (
                <div className="space-y-3">
                  {values.documentRequests.map((_, i) => (
                    <div
                      key={i}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">
                          Document {i + 1}
                        </p>
                        {values.documentRequests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className={labelClass}>
                            Document Type{" "}
                            <span className="text-red-500">*</span>
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
                        <div className="col-span-2">
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
                        <div>
                          <label className={labelClass}>
                            Start Date <span className="text-red-500">*</span>
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
                          <FieldErr name={`documentRequests[${i}].startDate`} />
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
                          <FieldErr name={`documentRequests[${i}].endDate`} />
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
                    className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Document
                  </button>
                </div>
              )}
            </FieldArray>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            {editingVehicle && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
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
  );
}

export function VehicleDocumentsModal({ owner, onClose }) {
  const [tab, setTab] = useState("view");
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);

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
    setTab("add");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Vehicle Details
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {owner.firstName} {owner.lastName} &bull; {owner.username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 shrink-0">
          <button
            onClick={() => {
              setTab("view");
              setEditingVehicle(null);
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === "view"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => {
              setTab("add");
              setEditingVehicle(null);
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === "add"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {tab === "view" && (
            <>
              {loading ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  Loading vehicle details...
                </div>
              ) : fetchError ? (
                <div className="py-16 text-center text-sm text-red-500">
                  {fetchError}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  No vehicles registered for this owner.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      onEdit={handleEditVehicle}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "add" && (
            <VehicleForm
              owner={owner}
              editingVehicle={editingVehicle}
              vehicleTypes={vehicleTypes}
              makes={makes}
              documentTypes={documentTypes}
              onSuccess={() => {
                loadOwner();
                setEditingVehicle(null);
                setTab("view");
              }}
              onCancel={() => {
                setEditingVehicle(null);
                setTab("view");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
