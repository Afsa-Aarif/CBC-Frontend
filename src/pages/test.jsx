import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CrystleLogo({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C5A028" />
        </linearGradient>
      </defs>
      <polygon points="50,10 85,35 70,85 30,85 15,35" fill="url(#goldGrad)" />
      <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">CBC</text>
    </svg>
  );
}

export default function TestPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/products`;
    
    axios.get(apiUrl)
      .then(res => {
        // Correctly handling both { products: [] } and direct array responses
        const fetchedData = res.data.products || res.data;
        setProducts(Array.isArray(fetchedData) ? fetchedData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF5F7] p-8 font-sans">
      
      {/* --- HEADER --- */}
      <header className="max-w-5xl mx-auto text-center mb-16">
        <CrystleLogo size={60} />
        <h1 className="text-3xl font-light tracking-[0.4em] text-[#4A4A4A] mt-6 uppercase">
          Inventory <span className="font-bold text-[#D4AF37]">Live</span>
        </h1>
        <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase italic">
          {products.length} Items Syncing from MongoDB
        </p>
      </header>

      {/* --- PRODUCT LIST --- */}
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {loading ? (
          <div className="text-center text-gray-400 tracking-widest animate-pulse py-20">
            ESTABLISHING SECURE CONNECTION...
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-white rounded-3xl border border-red-100 shadow-sm">
            <p className="text-red-400 font-bold uppercase tracking-widest">Connection Failed</p>
            <p className="text-gray-400 text-xs mt-2">{error}</p>
          </div>
        ) : (
          products.map((item) => (
            <div key={item._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50 flex items-center gap-8 hover:shadow-xl transition-all duration-500">
              
              {/* Product Image */}
              <div className="w-40 h-40 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                <img 
                  src={item.images && item.images[0] ? item.images[0] : "https://via.placeholder.com/150"} 
                  className="w-full h-full object-cover" 
                  alt={item.name} 
                />
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start border-b border-pink-50 pb-4">
                  <div>
                    <span className="text-[9px] font-black text-pink-300 uppercase tracking-[0.3em]">{item.category}</span>
                    <h3 className="text-2xl font-bold text-[#324F78] mt-1">{item.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-gray-800">LKR {item.price ? item.price.toLocaleString() : "0"}</p>
                    <p className="text-[10px] text-gray-300 font-mono mt-1 uppercase tracking-tighter">Internal Code: {item.productID}</p>
                  </div>
                </div>

                {/* --- UPDATED ACTION BUTTONS --- */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  
                  {/* ADMIN EDIT BUTTON */}
                  <Link 
                    to={`/admin/products/update/${item._id}`} 
                    className="flex-1 text-center px-6 py-3 bg-[#324F78] text-white text-[10px] font-bold rounded-full hover:bg-[#D4AF37] transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
                  >
                    Edit Document
                  </Link>

                  {/* CUSTOMER VIEW BUTTON */}
                  <Link 
                    to={`/product/${item._id}`} 
                    className="flex-1 text-center px-6 py-3 border border-[#324F78] text-[#324F78] text-[10px] font-bold rounded-full hover:bg-[#324F78] hover:text-white transition-all uppercase tracking-[0.2em]"
                  >
                    Live Preview
                  </Link>
                </div>

                {/* Database Reference Footer */}
                <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mt-4 text-center">
                  MongoDB Unique ID: {item._id}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 text-center pb-10">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.5em]">
          Crystal Beauty Collection • Developer Ops v2.5
        </p>
      </footer>
    </div>
  );
}