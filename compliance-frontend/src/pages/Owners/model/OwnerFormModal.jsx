import React from "react";
import { X } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ownerFormSchema } from "../schema/ownerFormSchema";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
const inputErrorClass =
  "w-full border border-red-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

function FieldError({ name }) {
  return (
    <ErrorMessage
      name={name}
      render={(msg) => <p className="mt-1 text-xs text-red-500">{msg}</p>}
    />
  );
}

export function OwnerFormModal({
  editingUser,
  initialValues,
  formError,
  submitting,
  closeModal,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">
            {editingUser ? "Edit Owner" : "Create Owner"}
          </h3>
          <button
            onClick={closeModal}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <Formik
          initialValues={initialValues}
          validationSchema={ownerFormSchema(!!editingUser)}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form className="px-6 py-5 space-y-4">
              {/* First / Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="firstName"
                    placeholder="John"
                    className={
                      errors.firstName && touched.firstName
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldError name="firstName" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="lastName"
                    placeholder="Doe"
                    className={
                      errors.lastName && touched.lastName
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldError name="lastName" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <Field
                  name="username"
                  placeholder="johndoe"
                  className={
                    errors.username && touched.username
                      ? inputErrorClass
                      : inputClass
                  }
                />
                <FieldError name="username" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className={
                    errors.email && touched.email ? inputErrorClass : inputClass
                  }
                />
                <FieldError name="email" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Password{" "}
                  {editingUser ? (
                    <span className="text-gray-400 font-normal">
                      (leave blank to keep unchanged)
                    </span>
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={
                    errors.password && touched.password
                      ? inputErrorClass
                      : inputClass
                  }
                />
                <FieldError name="password" />
              </div>

              {/* Contact / NIC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Contact Number
                  </label>
                  <Field
                    name="contactNumber"
                    placeholder="0771234567"
                    className={
                      errors.contactNumber && touched.contactNumber
                        ? inputErrorClass
                        : inputClass
                    }
                  />
                  <FieldError name="contactNumber" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    NIC
                  </label>
                  <Field
                    name="nic"
                    placeholder="199012345678"
                    className={
                      errors.nic && touched.nic ? inputErrorClass : inputClass
                    }
                  />
                  <FieldError name="nic" />
                </div>
              </div>

              {/* API Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Saving..." : editingUser ? "Update" : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
