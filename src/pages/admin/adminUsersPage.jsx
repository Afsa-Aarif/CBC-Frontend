import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MdOutlineAdminPanelSettings, MdVerified, MdErrorOutline } from "react-icons/md";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found. Please login.");
            navigate("/login");
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.get(`${API_BASE}/api/users/all-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = Array.isArray(res.data) ? res.data : res.data.users || [];
            setUsers(data);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.message || "Failed to connect to the server.");
            toast.error("Error fetching users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBlock = async (userId, currentStatus) => {
        const token = localStorage.getItem("token");
        
        try {
            await axios.put(
                `${API_BASE}/api/users/block-unblock/${userId}`, 
                { isBlock: !currentStatus }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlock: !currentStatus } : u));
            toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
        } catch (err) {
            console.error("Toggle Block Error:", err);
            toast.error("Action failed. Check server connection.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (isLoading) return <div className="pt-40 text-center font-black uppercase italic text-slate-400">Loading Records...</div>;

    if (error) {
        return (
            <div className="pt-40 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block border border-red-100">
                    <h2 className="font-bold text-lg">System Error</h2>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-bold">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white">
                        <div>
                            <h1 className="text-3xl font-black text-[#001529] tracking-tight uppercase italic">User Registry</h1>
                            <p className="text-gray-400 text-sm">Managing Crystal Beauty Access</p>
                        </div>
                        <div className="bg-[#001529] text-white px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase">
                            {users.length} Records Found
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr className="text-[#001529]/40 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                                    <th className="px-10 py-6">User Identity</th>
                                    <th className="px-6 py-6">Role</th>
                                    <th className="px-6 py-6 text-center">Verification</th>
                                    <th className="px-10 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length > 0 ? (
                                    users.map((user) => {
                                        // Safely resolve user profile image and catch backend string traps
                                        const hasValidImage = user.image && 
                                                              user.image !== "false" && 
                                                              user.image !== false && 
                                                              user.image !== "null";
                                        
                                        const avatarSrc = hasValidImage 
                                            ? (user.image.startsWith("http") || user.image.startsWith("data:") 
                                                ? user.image 
                                                : `${API_BASE}/${user.image.replace(/^\//, "")}`)
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || "User")}&background=001529&color=fff&bold=true`;

                                        return (
                                            <tr key={user._id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <img 
                                                            src={avatarSrc} 
                                                            className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-gray-100" 
                                                            alt=""
                                                            onError={(e) => {
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || "U")}&background=001529&color=fff`;
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="font-bold text-[#001529]">{user.firstName} {user.lastName}</div>
                                                            <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    {user.role === 'admin' ? (
                                                        <span className="text-pink-600 font-bold text-[10px] uppercase flex items-center gap-1 bg-pink-50 px-3 py-1 rounded-lg w-fit">
                                                            <MdOutlineAdminPanelSettings size={14}/> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wide bg-gray-100 px-3 py-1 rounded-lg w-fit">
                                                            Customer
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {user.isEmailVerified ? (
                                                        <div className="flex flex-col items-center text-blue-500">
                                                            <MdVerified size={22} />
                                                            <span className="text-[9px] font-black uppercase mt-1">Verified</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-300">
                                                            <MdErrorOutline size={22} />
                                                            <span className="text-[9px] font-black uppercase mt-1">Pending</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleToggleBlock(user._id, user.isBlock)}
                                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${user.isBlock ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                    >
                                                        {user.isBlock ? "Unblock" : "Block"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-gray-400 font-medium italic">
                                            No users currently registered.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}