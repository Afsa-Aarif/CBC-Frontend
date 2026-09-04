import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const formatLKR = (n) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(
        n ?? 0
    );

export default function OrderModal({ isModalOpen, selectedOrder, closeModal, refresh }) {
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (selectedOrder) {
            setStatus(selectedOrder.status || "pending");
        }
    }, [selectedOrder]);

    if (!isModalOpen || !selectedOrder) return null;

    const handleUpdate = () => {
        const token = localStorage.getItem("token");
        
        // Use _id from MongoDB. The console error "undefined" happened because this was missing.
        const orderId = selectedOrder._id; 

        axios.put(
            `${import.meta.env.VITE_API_URL}/api/orders/status/${orderId}`,
            { status: status },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
            toast.success("Order status updated");
            closeModal();
            refresh();
        })
        .catch((err) => {
            console.error("Update error:", err);
            toast.error("Failed to update order status");
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Order <span className="text-rose-500">Details</span></h2>
                        <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">ID: {selectedOrder._id}</p>
                    </div>
                    <button onClick={closeModal} className="text-2xl hover:text-rose-500 transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Customer Information</h3>
                            <p className="font-bold text-slate-800 uppercase text-sm">{selectedOrder.customerName}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.email || "No Email provided"}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.phone || "No Phone provided"}</p>
                            <p className="text-xs text-slate-600 mt-3 font-medium underline">Delivery Address:</p>
                            <p className="text-xs text-slate-500">{selectedOrder.address}</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment & Method</h3>
                            <p className="font-black text-rose-500 text-2xl">{formatLKR(selectedOrder.total)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Method: {selectedOrder.paymentMethod || "Cash on Delivery"}</p>
                            <div className="mt-4">
                                <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {selectedOrder.status || 'pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">Items in Order</div>
                        <div className="divide-y divide-slate-50">
                            {selectedOrder.items?.map((it, idx) => (
                                <div key={idx} className="p-4 flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-100" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{it.name || "Product"}</p>
                                            <p className="text-[10px] text-slate-400">Qty: {it.quantity} | PID: {it.productID?.substring(18)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">{formatLKR(it.price)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex-1 p-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={handleUpdate}
                        className="px-8 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                    >
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    );
}