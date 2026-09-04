// src/components/header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser } from 'react-icons/fi';

export default function Header() {
  const navigate = useNavigate();
  
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