import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/icon.jpg";
import {
  FiHome,
  FiCpu,
  FiCheckSquare,
  FiFileText,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { showNav, userData, setUserData } = useAuthContext();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  };

  const closeDrawer = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isAnimating ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAnimating]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await api.post("/auth/logout");
    setUserData(null);
    navigate("/");
  };

  const handleViewProfile = () => {
    setIsProfileOpen(false);
    navigate("/profile");
  };

  const navItems = [
    { name: "Dashboard", icon: FiHome, to: "/dashboard" },
    { name: "AI Planner", icon: FiCpu, to: "/ai-planner" },
    { name: "Tasks", icon: FiCheckSquare, to: "/tasks" },
    { name: "Notes", icon: FiFileText, to: "/notes" },
  ];

  const initials = userData
    ? `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    : "U";

  const fullName = userData
    ? `${userData.first_name} ${userData.last_name}`
    : "User";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b z-50"
        style={{ boxShadow: "rgba(0,0,0,0.08) 0px 4px 12px" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="Eduvia" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-xl text-gray-800">Eduvia</span>
            </div>

            {/* Desktop Nav */}
            {showNav && (
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 transition-colors ${
                          isActive
                            ? "text-purple-600 font-semibold"
                            : "text-gray-600 hover:text-purple-600"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {showNav ? (
                <>
                  {/* Profile Dropdown */}
                  <div className="relative hidden sm:block" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen((prev) => !prev)}
                      className="flex items-center gap-2 px-2 cursor-pointer py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {/* Avatar */}
                      {userData?.profile_img ? (
                        <img
                          src={userData.profile_img}
                          alt={fullName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-purple-200">
                          <span className="text-xs font-semibold text-purple-600">
                            {initials}
                          </span>
                        </div>
                      )}

                      <span className="text-sm text-gray-700 font-medium">
                        {userData?.first_name ?? "User"}
                      </span>

                      <FiChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                        style={{
                          animation: "dropdownIn 0.15s ease-out forwards",
                        }}
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {fullName}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {userData?.email}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="p-1">
                          <button
                            onClick={handleViewProfile}
                            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                          >
                            <FiUser className="w-4 h-4" />
                            View Profile
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={openDrawer}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <FiMenu className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="h-16 w-full"></div>

      {/* Mobile Drawer */}
      {showNav && isDrawerOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
          />

          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl md:hidden transition-transform duration-300 ${
              isAnimating ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Eduvia" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-gray-800">Eduvia</span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-purple-100 text-purple-600 font-semibold"
                          : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Profile Section in Drawer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
              <div className="flex items-center gap-3 mb-3">
                {userData?.profile_img ? (
                  <img
                    src={userData.profile_img}
                    alt={fullName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {userData?.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate("/profile");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <FiUser className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    closeDrawer();
                    handleLogout();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
