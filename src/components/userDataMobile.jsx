// src/components/userDataMobile.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  FaUserCog, FaShoppingBag, FaSignOutAlt, FaChevronRight, 
  FaChevronLeft, FaGem, FaEdit, FaCheckCircle, FaCamera, FaEnvelope, FaClock
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function UserDataMobile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // Controls sub-views: "menu" | "settings" | "orders" | "inquiries"
  const [activeSubView, setActiveSubView] = useState("menu");

  // Local Form States for Settings Mode
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Inquiries State
  const [myInquiries, setMyInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Reference for hidden file upload element
  const fileInputRef = useRef(null);

  // Mock Order Data
  const [orders] = useState([
    { id: "CB-8921", date: "2026-06-28", status: "Delivered", total: "LKR 7,200.00", items: "Luxury Glow Serum x1" },
    { id: "CB-7412", date: "2026-07-04", status: "In Transit", total: "LKR 3,200.00", items: "Hydrating Facial Cream x1" }
  ]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token != null) {
      axios
        .get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setFormData({
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            phone: res.data.phone || "",
            address: res.data.address || ""
          });
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch inquiries when activeSubView switches to "inquiries"
  useEffect(() => {
    if (activeSubView === "inquiries") {
      setInquiriesLoading(true);
      const token = localStorage.getItem("token");
      axios.get(`${API_URL}/api/contact/my-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setMyInquiries(res.data);
        setInquiriesLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not load support messages.");
        setInquiriesLoading(false);
      });
    }
  }, [activeSubView, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSaveSuccess(true);
      toast.success("Profile details updated successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const dataPayload = new FormData();
    dataPayload.append("image", file);

    setIsUploading(true);
    const uploadToastId = toast.loading("Uploading profile picture...");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/api/users/me`, dataPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile image updated!", { id: uploadToastId });
      window.location.reload(); 
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image.", { id: uploadToastId });
    } finally {
      setIsUploading(false);
    }
  };

  const hasValidImage = user?.image && 
                        user?.image !== "false" && 
                        user?.image !== false && 
                        user?.image !== "null";

  const avatarSrc = hasValidImage
    ? (user.image.startsWith("http") || user.image.startsWith("data:") 
        ? user.image 
        : `${API_URL}/${user.image.replace(/^\//, "")}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || "U")}&background=F43F5E&color=fff&bold=true`;

  if (!loading && !user) {
    return (
      <div className="w-full max-w-md mx-auto bg-white min-h-screen px-4 pt-28 pb-10 flex flex-col items-center text-center justify-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <FaUserCog size={28} />
        </div>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">Welcome to Crystal Beauty</h2>
        <p className="text-xs text-slate-400 font-bold tracking-wide uppercase mt-1 mb-6 max-w-[240px]">
          Log in to manage your account settings, orders, and support tickets
        </p>
        <a 
          href="/login" 
          className="w-full max-w-[200px] bg-slate-900 text-white text-center py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-md decoration-none"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen px-4 pt-28 pb-10 text-left font-sans block relative box-border">
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex justify-center items-end p-4">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 tracking-tight text-center">Confirm Logout</h3>
            <p className="text-xs text-slate-400 font-bold tracking-wide mt-2 text-center uppercase">
              Are you sure you want to sign out of Crystal Beauty?
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={handleLogout}
                className="w-full bg-rose-500 text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-md"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-40">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && user && (
        <div className="flex flex-col gap-6 w-full">
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-5 flex items-center gap-4 w-full box-border">
            <div 
              onClick={() => !isUploading && fileInputRef.current.click()}
              className="relative w-16 h-16 rounded-full border-2 border-rose-400 flex-shrink-0 cursor-pointer group overflow-hidden shadow-inner bg-slate-100"
              title="Click to change your photo"
            >
              <img 
                src={avatarSrc} 
                alt="Profile" 
                className={`w-full h-full object-cover transition-opacity duration-200 ${isUploading ? "opacity-40" : "group-hover:opacity-75"}`}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || "U")}&background=F43F5E&color=fff`;
                }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaCamera className="text-white text-sm" />
              </div>

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-rose-500 font-black tracking-widest uppercase flex items-center gap-1">
                <FaGem size={10} /> Premium Member
              </span>
              <h2 className="text-xl font-black text-slate-800 tracking-tight mt-0.5 truncate">
                Hello, {user.firstName || "User"}!
              </h2>
              <span className="text-xs font-bold text-slate-400 truncate">{user.email}</span>
            </div>
          </div>

          {activeSubView === "menu" && (
            <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 text-center w-full box-border">
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-slate-800">480</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">Glow Points</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-100">
                <span className="text-lg font-black text-slate-800">{orders.length}</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">Total Orders</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-rose-500">VIP</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">Tier</span>
              </div>
            </div>
          )}
          
          {activeSubView === "menu" && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-4 flex flex-col gap-1 w-full box-border">
              <button 
                type="button"
                onClick={() => setActiveSubView("settings")}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group w-full border-none cursor-pointer text-left bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-rose-500 transition-colors">
                    <FaUserCog size={16} />
                  </div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">Account Settings</span>
                </div>
                <FaChevronRight size={12} className="text-slate-300" />
              </button>

              <button 
                type="button"
                onClick={() => setActiveSubView("orders")}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group w-full border-none cursor-pointer text-left bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-rose-500 transition-colors">
                    <FaShoppingBag size={15} />
                  </div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">My Orders</span>
                </div>
                <FaChevronRight size={12} className="text-slate-300" />
              </button>

              <button 
                type="button"
                onClick={() => setActiveSubView("inquiries")}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group w-full border-none cursor-pointer text-left bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-rose-500 transition-colors">
                    <FaEnvelope size={15} />
                  </div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">My Inquiries & Support</span>
                </div>
                <FaChevronRight size={12} className="text-slate-300" />
              </button>

              <hr className="my-2 border-slate-100 w-full" />

              <button 
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50/50 transition-all group border-none cursor-pointer text-left bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                    <FaSignOutAlt size={15} />
                  </div>
                  <span className="text-sm font-black text-rose-600 tracking-tight">Logout</span>
                </div>
                <FaChevronRight size={12} className="text-rose-300" />
              </button>
            </div>
          )}

          {activeSubView === "settings" && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-6 flex flex-col gap-4 w-full box-border">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setActiveSubView("menu")} 
                  className="text-slate-400 p-1 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                >
                  <FaChevronLeft size={14} />
                </button>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider ml-1">Edit Account Details</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+94 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Shipping Address</label>
                  <textarea 
                    rows="2"
                    placeholder="Enter street name, city and postal zip code"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400 transition resize-none"
                  />
                </div>

                {saveSuccess && (
                  <div className="bg-emerald-50 text-emerald-600 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2">
                    <FaCheckCircle /> Profile information saved perfectly!
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-slate-900 text-white text-xs font-black uppercase tracking-widest py-4 rounded-xl shadow-md hover:bg-slate-800 transition mt-2 flex justify-center items-center gap-2 border-none cursor-pointer"
                >
                  {isSaving ? "Processing..." : <><FaEdit /> Save Profile changes</>}
                </button>
              </form>
            </div>
          )}

          {activeSubView === "orders" && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-6 flex flex-col gap-4 w-full box-border">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <button 
                  type="button"
                  onClick={() => setActiveSubView("menu")} 
                  className="text-slate-400 p-1 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                >
                  <FaChevronLeft size={14} />
                </button>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider ml-1">Your Purchase Logs</h3>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {orders.map((order, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2 w-full box-border">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-black text-slate-800">{order.id}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{order.items}</span>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 mt-1 w-full">
                      <span className="text-[10px] text-slate-400 font-medium">{order.date}</span>
                      <span className="text-xs font-black text-slate-900">{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubView === "inquiries" && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-6 flex flex-col gap-4 w-full box-border">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <button 
                  type="button"
                  onClick={() => setActiveSubView("menu")} 
                  className="text-slate-400 p-1 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                >
                  <FaChevronLeft size={14} />
                </button>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider ml-1">Support Responses</h3>
              </div>

              {inquiriesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              ) : myInquiries.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center py-6">No support messages found.</p>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {myInquiries.map((ticket) => (
                    <div key={ticket._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 w-full box-border">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <FaClock size={10} /> {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          ticket.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400">Your Message:</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">"{ticket.message}"</p>
                      </div>

                      {ticket.reply ? (
                        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/60 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <FaCheckCircle /> Support Reply:
                          </p>
                          <p className="text-xs font-medium text-slate-800">{ticket.reply}</p>
                        </div>
                      ) : (
                        <p className="text-[10px] font-black uppercase text-amber-500 text-right">Awaiting Admin Reply...</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}