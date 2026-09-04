// src/components/userData.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import toast from "react-hot-toast";

export default function UserData() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve user payload strings safely from localStorage
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = localStorage.getItem("role") || user?.role || "customer";

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Compute clean name initials for fallback display
  const firstName = user?.firstName || "U";
  const lastName = user?.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Safely intercept and evaluate profile picture strings matching "false" or "null"
  const hasValidImage = user?.image && 
                        user?.image !== "false" && 
                        user?.image !== false && 
                        user?.image !== "null";

  const avatarSrc = hasValidImage
    ? (user.image.startsWith("http") || user.image.startsWith("data:") 
        ? user.image 
        : `${API_BASE}/${user.image.replace(/^\//, "")}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=F43F5E&color=fff&bold=true`;

  // Close dropdown when clicking outside the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setIsOpen(false);
    navigate("/login");
    window.location.reload();
  };

  if (!token || !user) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Interactive Profile Bubble Container Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100 shadow-sm focus:outline-none"
      >
        <img
          src={avatarSrc}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=F43F5E&color=fff`;
          }}
        />
        <div className="hidden md:flex flex-col text-left px-1">
          <span className="text-[10px] font-black tracking-tight text-slate-800 leading-none">
            {firstName} {lastName}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            {userRole}
          </span>
        </div>
        <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-200 hidden md:block ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Action Menu Dropdown View */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden z-50 transform origin-top-right transition-all">
          
          {/* Identity Header Panel */}
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Logged in as</p>
            <p className="text-xs font-black text-slate-800 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="p-1.5 space-y-0.5">
            {/* Conditional Routing Node: Admin vs Customer Viewports */}
            {userRole.toLowerCase() === "admin" ? (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
              >
                <MdOutlineAdminPanelSettings size={16} />
                Admin Dashboard
              </Link>
            ) : (
              /* FIXED REDIRECT target: Changed routing from settings sub-form to main central profile hub */
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <FiUser size={16} className="text-slate-400" />
                My Profile
              </Link>
            )}

            {/* General Account Profile Hub Redirection */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <FiSettings size={16} className="text-slate-400" />
              Account Settings
            </Link>

            <hr className="border-slate-100 my-1 mx-2" />

            {/* Kill Session Action Trigger */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <FiLogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}