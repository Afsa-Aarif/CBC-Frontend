import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { FaChartLine, FaPlusSquare, FaSignOutAlt, FaEnvelope, FaTag } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { BsBox2Heart } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import AdminProductPage from "./admin/adminProductPage";
import AddProductPage from "./admin/adminAddNewProduct";
import UpdateProductPage from "./admin/adminUpdateProduct";
import AdminOrdersPage from "./admin/adminOrdersPage";
import AdminInquiriesPage from "./admin/adminInquiriesPage";
import AdminPromotionsPage from "./admin/adminPromotionsPage"; // <-- NEW PROMOTIONS IMPORT
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader } from "../components/loader";
import AdminUsersPage from "./admin/adminUsersPage";

export default function AdminPage() {
    const navigate = useNavigate();
    const [userLoaded, setUserLoaded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            toast.error("Please login to access admin panel");
            navigate("/login");
            return;
        }

        axios.get(import.meta.env.VITE_API_URL + "/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            if (res.data.role !== "admin") {
                toast.error("Unauthorized: Admin access only");
                navigate("/");
                return;
            }
            setUserLoaded(true);
        }).catch((err) => {
            console.error("Admin Auth Error:", err);
            toast.error("Session invalid or expired");
            localStorage.removeItem("token");
            navigate("/login");
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="w-full h-screen bg-slate-50 flex p-4 pt-[100px] text-slate-800 font-sans">
            
            {/* Sidebar */}
            <div className="w-[280px] h-full flex flex-col items-center gap-4 pr-4">
                <div className="flex flex-row w-full h-20 bg-slate-900 items-center justify-center rounded-2xl shadow-lg mb-6">
                    <img
                        src="/logo.png"
                        alt="CBC Logo"
                        className="h-12 invert"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-white font-bold ml-2 uppercase tracking-tighter">Admin Panel</span>
                </div>

                <nav className="w-full flex flex-col gap-2 flex-grow">
                    <SidebarLink to="/admin" icon={<FaChartLine />} label="Dashboard" />
                    <SidebarLink to="/admin/orders" icon={<MdShoppingCartCheckout />} label="Orders" />
                    <SidebarLink to="/admin/products" icon={<BsBox2Heart />} label="Products" />
                    <SidebarLink to="/admin/add-product" icon={<FaPlusSquare />} label="Add New Product" />
                    <SidebarLink to="/admin/users" icon={<HiOutlineUsers />} label="Users text" />
                    <SidebarLink to="/admin/inquiries" icon={<FaEnvelope />} label="Inquiries" />
                    <SidebarLink to="/admin/promotions" icon={<FaTag />} label="Promotions" /> {/* NEW LINK */}
                </nav>

                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-red-500 font-semibold hover:bg-red-50 transition-all duration-200 mt-auto"
                >
                    <FaSignOutAlt className="text-xl" />
                    Logout
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 h-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="h-full w-full overflow-y-auto p-8">
                    {userLoaded ? (
                        <Routes>
                            <Route path="/" element={<AdminDashboardHome />} />
                            <Route path="/products" element={<AdminProductPage />} />
                            <Route path="/orders" element={<AdminOrdersPage />} />
                            <Route path="/add-product" element={<AddProductPage />} />
                            <Route path="/update-product/:id" element={<UpdateProductPage />} />
                            <Route path="/users" element={<AdminUsersPage />} />
                            <Route path="/inquiries" element={<AdminInquiriesPage />} />
                            <Route path="/promotions" element={<AdminPromotionsPage />} /> {/* NEW ROUTE */}
                        </Routes>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader />
                                <p className="text-slate-400 text-sm font-medium animate-pulse">Verifying Admin Identity...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminDashboardHome() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase">System Overview</h1>
                <p className="text-slate-500">Welcome back to the Crystal Beauty Clear control center.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-bold">Server Online</p>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <Link
            to={to}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-slate-500 font-semibold hover:bg-slate-900 hover:text-white transition-all duration-200"
        >
            <span className="text-xl">{icon}</span>
            {label}
        </Link>
    );
}