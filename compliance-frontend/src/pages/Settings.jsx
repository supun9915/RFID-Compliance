import React from "react";
import { Save, Bell, Lock, Globe, Database, Mail } from "lucide-react";
export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Sidebar for Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              <button className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 border-l-4 border-gray-600 text-sm font-medium">
                <Globe className="w-5 h-5" />
                General Settings
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors">
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors">
                <Lock className="w-5 h-5" />
                Security & Access
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors">
                <Database className="w-5 h-5" />
                Data Retention
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors">
                <Mail className="w-5 h-5" />
                Email Templates
              </button>
            </nav>
          </div>
        </div>

        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              General Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Vehicle Compliance System"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Code
                  </label>
                  <input
                    type="text"
                    defaultValue="ORG-8821"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  defaultValue="support@vcomply.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-gray-500">
                    Prevent users from accessing the system
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle1"
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"
                  />

                  <label
                    htmlFor="toggle1"
                    className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Auto-Archive Logs
                  </p>
                  <p className="text-xs text-gray-500">
                    Archive logs older than 90 days
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle2"
                    defaultChecked
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-600 right-0"
                  />

                  <label
                    htmlFor="toggle2"
                    className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-600 cursor-pointer"
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500">
                    Enforce 2FA for all admin users
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle3"
                    defaultChecked
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-600 right-0"
                  />

                  <label
                    htmlFor="toggle3"
                    className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-600 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
