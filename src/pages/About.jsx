import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiHeart, FiShield, FiTruck } from 'react-icons/fi';

export default function About() {
  const values = [
    {
      icon: <FiHeart className="text-3xl text-rose-500" />,
      title: "100% Cruelty-Free",
      desc: "All our formulations are ethically sourced and never tested on animals."
    },
    {
      icon: <FiShield className="text-3xl text-emerald-500" />,
      title: "Dermatologist Tested",
      desc: "Safe for all skin types, crafted with premium, clean ingredients."
    },
    {
      icon: <FiAward className="text-3xl text-amber-500" />,
      title: "Premium Quality",
      desc: "Designed to give your skin a natural, radiant glow every single day."
    },
    {
      icon: <FiTruck className="text-3xl text-indigo-500" />,
      title: "Fast Shipping",
      desc: "Hassle-free delivery direct to your doorstep with real-time tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Our Story</span>
          <h1 className="text-4xl lg:text-6xl font-black italic tracking-tight text-slate-900 uppercase">
            Crystal Beauty
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base leading-relaxed">
            Empowering your natural radiance with thoughtful skincare formulations designed for simplicity, efficacy, and pure elegance.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl">{v.icon}</div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{v.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 lg:p-16 text-center space-y-6">
          <h2 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tight">Ready to Elevate Your Glow?</h2>
          <p className="text-slate-400 text-xs lg:text-sm max-w-xl mx-auto">
            Explore our curated catalog of premium beauty essentials tailored specifically for modern skin health.
          </p>
          <Link 
            to="/products" 
            className="inline-block bg-white text-slate-900 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-lg"
          >
            Shop Products
          </Link>
        </div>

      </div>
    </div>
  );
}