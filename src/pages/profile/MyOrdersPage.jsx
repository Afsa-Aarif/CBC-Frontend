import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiPackage, BiArrowBack, BiCheckCircle } from "react-icons/bi";
import axios from "axios";

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/user/${user.email}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.email) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user.email, API_URL]);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate("/profile")} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-6 text-[10px] font-black uppercase tracking-widest"
        >
          <BiArrowBack size={18}/> Back to Profile
        </button>

        <h1 className="text-3xl font-black uppercase italic text-slate-900 mb-8">My Purchase History</h1>

        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">Loading Orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <BiPackage size={30} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Order ID</p>
                    <p className="font-bold text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                  <div className="flex items-center gap-1 font-bold text-emerald-500">
                    <BiCheckCircle /> {order.status || "Paid"}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400">Total Amount</p>
                  <p className="font-black text-slate-900 text-lg">LKR {order.total || order.amount}</p>
                </div>

                <button 
                  onClick={() => {
                    const targetId = order.items?.[0]?.productID;
                    if (targetId) {
                      navigate(`/product/${targetId}`);
                    } else {
                      alert("Product ID reference missing on this record.");
                    }
                  }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <BiPackage size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">No Orders Yet</h2>
            <p className="text-slate-500 mt-2 mb-8 text-sm">When you buy Crystal Beauty products, they will appear here.</p>
            <button 
              onClick={() => navigate("/shop")} 
              className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}