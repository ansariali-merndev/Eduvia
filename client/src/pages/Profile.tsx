import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  FiMail,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiLock,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuthContext } from "../context/AuthContext";
import { PasswordInput } from "../components/reusable/PasswordInput";
import { api } from "../lib/axios";
import { handleAlert } from "../lib/swal";

const initChangePass = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

export const Profile = () => {
  const { userData, setUserData } = useAuthContext();
  const navigate = useNavigate();

  const [passData, setPassData] = useState(initChangePass);
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [showPassSection, setShowPassSection] = useState(false);

  if (!userData) return <Navigate to="/" />;

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPassLoading) return;
    setIsPassLoading(true);
    try {
      const res = await api.put("/auth/change-password", passData);
      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        return;
      }
      handleAlert(res.data.message, "success");
      setPassData(initChangePass);
      setShowPassSection(false);
    } catch (err) {
      handleAlert(
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to change password."
          : "",
        "error",
      );
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLogoutLoading) return;
    setIsLogoutLoading(true);
    try {
      await api.post("/auth/logout");
    } finally {
      setUserData(null);
      navigate("/login");
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const initials =
    `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ── Page Title ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your account information and security
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── LEFT: Profile identity card ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Identity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="h-28 w-full relative"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6366f1 60%, #a855f7 100%)",
                }}
              >
                {/* subtle grid overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="flex justify-between items-end -mt-11 mb-4">
                  <div className="relative">
                    {userData.profile_img ? (
                      <img
                        src={userData.profile_img}
                        alt={`${userData.first_name} ${userData.last_name}`}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 ring-4 ring-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl font-black text-white">
                          {initials}
                        </span>
                      </div>
                    )}
                    {userData.is_verified && (
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <FiCheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <span
                    className={`mb-1 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${userData.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                  >
                    <FiShield className="w-3 h-3" />
                    {userData.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {userData.first_name} {userData.last_name}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5 truncate">
                  {userData.email}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-50 my-4" />

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                      Member Since
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">
                      {new Date(userData.created_at).toLocaleDateString(
                        "en-IN",
                        { month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                      Account ID
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">
                      #{userData.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 font-medium mb-3">Session</p>
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                {isLogoutLoading ? "Logging out…" : "Logout from Eduvia"}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Details + Password ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Account Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-violet-500" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Account Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: FiUser,
                    label: "First Name",
                    value: userData.first_name,
                  },
                  {
                    icon: FiUser,
                    label: "Last Name",
                    value: userData.last_name,
                  },
                  {
                    icon: FiMail,
                    label: "Email Address",
                    value: userData.email,
                    full: true,
                  },
                  {
                    icon: FiClock,
                    label: "Last Login",
                    value: formatDate(userData.last_login),
                  },
                  {
                    icon: FiCalendar,
                    label: "Member Since",
                    value: formatDate(userData.created_at),
                  },
                ].map(({ icon: Icon, label, value, full }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-4 bg-gray-50/70 rounded-xl border border-gray-100/80 ${full ? "sm:col-span-2" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 font-medium">
                        {label}
                      </p>
                      <p className="text-sm text-gray-800 font-semibold truncate mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPassSection((p) => !p)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                    <FiLock className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">
                      Change Password
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Update your account security
                    </p>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center transition-colors ${showPassSection ? "bg-violet-100" : ""}`}
                >
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${showPassSection ? "rotate-180 text-violet-600" : "text-gray-400"}`}
                  />
                </div>
              </button>

              {showPassSection && (
                <div className="px-6 pb-6 border-t border-gray-50">
                  <form
                    onSubmit={handleChangePassword}
                    className="flex flex-col gap-4 pt-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                      <PasswordInput
                        value={passData.old_password}
                        onChange={handlePassChange}
                        name="old_password"
                        label="Current Password"
                        placeholder="Enter current password"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PasswordInput
                          value={passData.new_password}
                          onChange={handlePassChange}
                          name="new_password"
                          label="New Password"
                          placeholder="Min. 8 characters"
                        />
                        <PasswordInput
                          value={passData.confirm_password}
                          onChange={handlePassChange}
                          name="confirm_password"
                          label="Confirm New Password"
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPassSection(false);
                          setPassData(initChangePass);
                        }}
                        disabled={isPassLoading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPassLoading}
                        className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
                      >
                        {isPassLoading ? "Updating…" : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
