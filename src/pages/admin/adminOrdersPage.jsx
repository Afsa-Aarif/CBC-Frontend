import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader  from "../../components/loader.jsx";
import OrderModal from "../../components/orderInfoModal";
import { BiPackage, BiUser, BiPhone } from "react-icons/bi";
import { FaTag } from "react-icons/fa";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } fontFinally: {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="w-full min-h-screen bg-slate-50/50 p-4 lg:p-10 pt-28 lg:pt-32">
            <OrderModal 
                isModalOpen={isModalOpen} 
                closeModal={() => setIsModalOpen(false)} 
                selectedOrder={selectedOrder} 
                refresh={fetchOrders} 
            />
        
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                            Incoming <span className="text-rose-500">Orders</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Logistics & Promotion Analytics</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <BiPackage className="text-rose-500" size={20} />
                        <span className="font-black text-sm uppercase tracking-widest text-slate-700">{orders.length} Total Shipments</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Customer & Contact</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Address</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Promo Used</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right">Payment Breakdown</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((order) => (
                                    <tr key={order._id} onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="hover:bg-rose-50/30 transition-colors cursor-pointer">
                                        <td className="px-6 py-6">
                                            <p className="font-black uppercase text-xs text-slate-800">{order.customerName}</p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><BiUser /> {order.email}</span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><BiPhone /> {order.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-[11px] font-bold text-slate-500 uppercase">{order.address}</td>
                                        
                                        {/* NEW: Promo Code Column */}
                                        <td className="px-6 py-6 text-center">
                                            {order.couponCode ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        <FaTag size={9} /> {order.couponCode}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-emerald-600 mt-1">
                                                        - LKR {order.discountAmount?.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">—</span>
                                            )}
                                        </td>

                                        {/* NEW: Payment Breakdown Column */}
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-xs font-black text-slate-900">LKR {order.total?.toLocaleString()}</p>
                                            {order.discountAmount > 0 && (
                                                <p className="text-[9px] text-slate-400 line-through">
                                                    Subtotal: LKR {order.subtotal?.toLocaleString()}
                                                </p>
                                            )}
                                            <p className="text-[9px] text-rose-500 uppercase font-bold mt-0.5">{order.paymentMethod}</p>
                                        </td>

                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}