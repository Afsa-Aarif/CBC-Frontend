import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import UserData from './userData'; // Added UserData widget import reference cleanly

export default function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link to="/" className="text-xl font-black italic tracking-tighter">
          CRYSTAL<span className="text-rose-500">BEAUTY</span>
        </Link>
        
        {/* Center Links */}
        <div className="flex gap-8 items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
          <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-rose-500 transition-colors">Shop</Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex gap-6 items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
          
          {/* Cart Link */}
          <Link to="/cart" className="flex items-center gap-1.5 hover:text-rose-500 transition-colors relative p-2">
            <FiShoppingBag size={18} className="text-slate-800" />
            <span className="hidden md:inline">Cart</span>
          </Link>

          {/* User Session Interface Node Toggle */}
          {token ? (
            <div className="flex items-center justify-center min-w-[40px]">
              <UserData />
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-rose-500 transition-all text-[9px] tracking-widest"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}