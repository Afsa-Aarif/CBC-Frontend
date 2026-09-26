// src/components/header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiUser, FiBell } from 'react-icons/fi';

export default function Header() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
useEffect(() => {
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  fetchNotifications();
}, []);
const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update the notification locally
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
};
  
  // Replace these with your actual state/auth logic if using Context or Redux
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Afsa Aarif', role: 'ADMIN' };
  const cartCount = 0; 

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">
          CRYSTAL<span className="text-rose-500">BEAUTY</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-600">
          <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-rose-500 transition-colors">Products</Link>
          <Link to="/about" className="hover:text-rose-500 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-rose-500 transition-colors">Contact</Link>
        </nav>

        {/* Right Controls: Cart & Profile Badge */}
        <div className="flex items-center gap-6">
          {/* Notification Bell */}
{localStorage.getItem("token") && (
  <button
    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
    className="relative p-2 text-slate-700 hover:text-rose-500 transition-colors"
    aria-label="Notifications"
  >
    <FiBell size={20} />

    {notifications.filter((notification) => !notification.isRead).length > 0 && (
      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
        {notifications.filter((notification) => !notification.isRead).length}
      </span>
    )}
  </button>
)}
{/* Notification Panel */}
{isNotificationOpen && (
  <div className="absolute right-24 top-16 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
    
    {/* Panel Header */}
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-900">
          Notifications
        </h3>
        <p className="text-[10px] text-slate-400 mt-1">
          Your latest updates
        </p>
      </div>

      <span className="text-[10px] font-bold text-rose-500">
        {notifications.filter((notification) => !notification.isRead).length} unread
      </span>
    </div>

    {/* Notifications List */}
    <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <FiBell className="mx-auto text-slate-300 mb-3" size={28} />
          <p className="text-sm font-bold text-slate-500">
            No notifications
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            You're all caught up!
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
  key={notification._id}
  onClick={() => markNotificationAsRead(notification._id)}
  className={`px-5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
              notification.isRead
                ? "bg-white"
                : "bg-rose-50"
            }`}
          >
            <h4 className="text-xs font-black text-slate-800">
              {notification.title}
            </h4>

            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {notification.message}
            </p>

            <p className="text-[9px] text-slate-400 mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)}
          
          {/* Cart Link */}
          <Link to="/cart" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-rose-500 transition-colors">
            <FiShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Admin Badge */}
          {user ? (
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.name ? user.name.charAt(0) : <FiUser />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
              </div>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-rose-500 transition-all"
            >
              Login
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}