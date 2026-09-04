import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-center overflow-hidden">
            <img 
                src="/bg.jpg" 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover z-0 scale-105 blur-[2px]" 
            />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 flex flex-col items-center px-4">
                <h1 className="mb-4 font-bold text-5xl md:text-7xl leading-tight text-white drop-shadow-2xl">
                    Crystal Beauty Clear
                </h1>
                <p className="mb-8 font-black uppercase tracking-[0.3em] max-w-2xl text-xs md:text-sm text-white drop-shadow-md">
                    YOUR PREMIUM DESTINATION FOR GLOBAL BEAUTY BRANDS
                </p>
                <Link 
                    to="/products" 
                    className="px-10 py-4 bg-white text-slate-900 rounded-full font-black text-[10px] tracking-widest uppercase shadow-2xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110"
                >
                    EXPLORE MARKETPLACE
                </Link>
            </div>
        </div>
    );
};

export default function HomePage() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <main className="flex-grow">
                <HeroSection />
            </main>
            <footer className="w-full py-8 text-center text-slate-400 text-[9px] uppercase tracking-[0.2em] bg-white border-t border-slate-100">
                © 2026 Crystal Beauty Clear — All Rights Reserved
            </footer>
        </div>
    );
}