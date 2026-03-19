import React from "react";
import { Bell, Search, Menu, LogOut, Loader2, User, X } from "lucide-react";
import { logoutUser } from "../../api/authApi";

export function TopBar({ onLogout, onNavigate }) {
  // Read stored user info
  let user = {};
  try {
    const stored = localStorage.getItem("user");
    if (stored) user = JSON.parse(stored);
  } catch (_) {}

  const firstName = user.firstName || user.first_name || "";
  const lastName = user.lastName || user.last_name || "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.fullName ||
    user.name ||
    user.username ||
    "Admin";

  const rawRole = user.role || user.userRole || "";
  const role =
    typeof rawRole === "object" && rawRole !== null
      ? rawRole.roleName || rawRole.name || ""
      : rawRole;

  const [loggingOut, setLoggingOut] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
    setLoggingOut(false);
    if (onLogout) onLogout();
  };

  return (
    <header className="h-16 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles, owners..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-3 pl-1 relative">
          {/* Clickable user info + avatar */}
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              {role && (
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {role}
                </p>
              )}
            </div>

            {/* Avatar initials */}
            <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase">
                {displayName.charAt(0)}
              </span>
            </div>
          </button>

          {/* User details dropdown */}
          {showProfile && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowProfile(false)}
              />
              <div className="absolute right-12 top-12 z-30 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-lg font-bold uppercase">
                        {displayName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {displayName}
                      </p>
                      <p className="text-gray-300 text-xs uppercase tracking-wide">
                        {role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="px-5 py-4 space-y-3">
                  {[
                    { label: "First Name", value: user.firstName || "—" },
                    { label: "Last Name", value: user.lastName || "—" },
                    { label: "Username", value: user.username || "—" },
                    { label: "Email", value: user.email || "—" },
                    { label: "Role", value: role || "—" },
                    { label: "User ID", value: user.id ? `#${user.id}` : "—" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {label}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* My Account */}
                <div className="px-5 pb-2">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      if (onNavigate) onNavigate("account");
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 px-5 py-3">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-red-600  hover:bg-red-700 rounded-lg py-2 transition-colors disabled:opacity-50"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {loggingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
