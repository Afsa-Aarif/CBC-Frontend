import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BiHeart, BiArrowBack, BiTrash } from "react-icons/bi";
import axios from "axios";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user.email) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/wishlist/${user.email}`);
        // Safely filter products that might be null or missing productID
        const items = res.data.products?.filter(item => item && item.productID) || [];
        setWishlistItems(items);
      } catch (error) {
        console.error("Fetch Wishlist Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user.email, API_URL]);

  const handleRemove = async (productId) => {
    try {
      const res = await axios.post(`${API_URL}/api/wishlist/toggle`, {
        email: user.email,
        productID: productId
      });
      const items = res.data.products?.filter(item => item && item.productID) || [];
      setWishlistItems(items);
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Could not remove item");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-400 rounded-full animate-spin mb-4"></div>
        <div className="font-black uppercase tracking-widest text-slate-400 text-xs">
          Loading Favorites...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-6 text-[10px] font-black uppercase tracking-widest">
          <BiArrowBack size={18}/> Back to Profile
        </button>

        <h1 className="text-3xl font-black uppercase italic mb-8 text-slate-900">My Favorites</h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mx-auto mb-6">
              <BiHeart size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-slate-500 mt-2 mb-8">Save your favorite beauty products for later!</p>
            <button onClick={() => navigate("/shop")} className="border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.productID?._id} className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                <button 
                  onClick={() => handleRemove(item.productID?._id)}
                  className="absolute top-4 right-4 p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-colors z-10"
                >
                  <BiTrash size={20} />
                </button>
                
                <Link to={`/product/${item.productID?._id}`}>
                  <div className="aspect-square rounded-[2rem] bg-slate-50 mb-6 overflow-hidden flex items-center justify-center p-8">
                    <img 
                      src={item.productID?.images?.[0] || "https://via.placeholder.com/150"} 
                      alt={item.productID?.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="px-2">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{item.productID?.category}</span>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight mt-1 mb-2 group-hover:text-rose-500 transition-colors">
                      {item.productID?.name}
                    </h3>
                    <p className="text-xl font-black text-slate-900">
                      LKR {item.productID?.price?.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}