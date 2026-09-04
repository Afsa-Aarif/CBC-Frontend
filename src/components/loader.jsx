export function Loader() {
  return (
    <div className="w-full flex flex-col justify-center items-center py-20 min-h-[400px] animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className="absolute w-[120px] h-[120px] rounded-full border border-pink-500/20 animate-ping opacity-20"></div>
        
        {/* Main Spinning Circle */}
        <div className="w-[80px] h-[80px] border-[3px] border-gray-100 border-t-pink-500 rounded-full animate-spin shadow-inner"></div>
        
        {/* Static Inner Logo or Dot */}
        <div className="absolute w-2 h-2 bg-[#001529] rounded-full"></div>
      </div>
      
      {/* Optional Brand Text */}
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#001529]/40 animate-pulse">
        Initializing Crystal Beauty
      </p>
    </div>
  );
}