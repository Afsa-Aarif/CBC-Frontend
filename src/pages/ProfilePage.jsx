import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiSettings, FiShoppingBag, FiLogOut, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Get existing user state
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [activeTab, setActiveTab] = useState("menu"); // "menu" or "edit_details"

  // Sync state if localStorage updates externally
  useEffect(() => {
    const handleSync = () => {
      const updatedData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(updatedData);
      setFormData({
        firstName: updatedData?.firstName || updatedData?.name?.split(" ")[0] || "",
        lastName: updatedData?.lastName || updatedData?.name?.split(" ").slice(1).join(" ") || "",
        phoneNumber: updatedData?.phone || updatedData?.phoneNumber || "",
        address: typeof updatedData?.shippingAddress === 'object' ? updatedData?.shippingAddress?.street : (updatedData?.shippingAddress || updatedData?.address || ""),
      });
    };
    window.addEventListener("userUpdated", handleSync);
    return () => window.removeEventListener("userUpdated", handleSync);
  }, []);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    phoneNumber: user?.phone || user?.phoneNumber || "",
    address: typeof user?.shippingAddress === 'object' ? user?.shippingAddress?.street : (user?.shippingAddress || user?.address || ""),
  });

  const [isUploading, setIsUploading] = useState(false);

  // FIXED: Cleanses and resolves absolute image assets URL properly for the UI circle view
  const currentAvatar = user?.image
    ? user.image.startsWith("http") || user.image.startsWith("data:image")
      ? user.image
      : `${API_URL}/${user.image.replace(/^\//, "")}`
    : "https://placehold.co/150?text=Profile";

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be smaller than 2MB");
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      const dataToSend = new FormData();
      
      dataToSend.append("image", file);

      const res = await axios.put(
        `${API_URL}/api/users/me`, 
        dataToSend,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          } 
        }
      );
      
      const updatedUser = res.data?.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("userUpdated"));
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // FIXED: Switched to JSON body request to safely preserve existing user fields like 'image'
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phoneNumber,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        shippingAddress: {
          street: formData.address,
          city: user?.shippingAddress?.city || "Colombo",
          postalCode: user?.shippingAddress?.postalCode || "00300",
          country: user?.shippingAddress?.country || "Sri Lanka"
        },
        // We explicitly pass back the existing image URL string so the backend won't erase it!
        image: user?.image || ""
      };

      const res = await axios.put(`${API_URL}/api/users/me`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const updatedUser = res.data?.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("userUpdated"));
      
      toast.success("Account details saved!");
      setActiveTab("menu");
    } catch (err) {
      console.error(err);
      toast.error("Could not update profile metadata adjustments.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out safely");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* PROFILE HEADER BLOCK */}
        <div className="p-8 border-b border-slate-50 flex items-center gap-5 relative bg-white">
          
          {/* INTERACTIVE AVATAR UPLOAD CIRCLE */}
          <div 
            onClick={handleAvatarClick}
            className="group relative w-20 h-20 rounded-full border-2 border-rose-100 p-0.5 cursor-pointer overflow-hidden flex-shrink-0 bg-slate-100"
          >
            <img 
              src={currentAvatar} 
              alt="Profile Avatar" 
              className={`w-full h-full object-cover rounded-full transition-transform ${isUploading ? 'opacity-40' : 'group-hover:scale-105'}`}
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera className="text-white" size={18} />
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
              Premium Member
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Hello, {user?.firstName || user?.name?.split(" ")[0] || "Nisha"}!
            </h2>
            <p className="text-xs font-medium text-slate-400">{user?.email || "Nisha98@gmail.com"}</p>
          </div>
        </div>

        {/* CONDITIONALLY RENDER LOWER TABS */}
        {activeTab === "menu" ? (
          <>
            {/* STATS PREVIEW */}
            <div className="grid grid-cols-3 gap-2 px-8 py-4 bg-slate-50/50 border-b border-slate-50 text-center">
              <div>
                <div className="text-sm font-black text-slate-800">480</div>
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Glow Points</div>
              </div>
              <div className="border-x border-slate-100">
                <div className="text-sm font-black text-slate-800">2</div>
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Orders</div>
              </div>
              <div>
                <div className="text-sm font-black text-rose-500 italic uppercase">VIP</div>
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tier</div>
              </div>
            </div>

            {/* ACTION SELECTIONS NAVIGATION LIST */}
            <div className="p-6 space-y-2">
              <button 
                onClick={() => setActiveTab("edit_details")}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4 text-slate-700 font-bold text-xs uppercase tracking-wide">
                  <FiSettings size={16} className="text-slate-400 group-hover:text-slate-900" />
                  Account Settings
                </div>
                <FiChevronRight className="text-slate-300 group-hover:text-slate-900" />
              </button>

              <button 
                onClick={() => navigate("/orders")}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4 text-slate-700 font-bold text-xs uppercase tracking-wide">
                  <FiShoppingBag size={16} className="text-slate-400 group-hover:text-slate-900" />
                  My Orders
                </div>
                <FiChevronRight className="text-slate-300 group-hover:text-slate-900" />
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50 text-rose-500 transition-all text-left group"
              >
                <div className="flex items-center gap-4 font-black text-xs uppercase tracking-wide">
                  <FiLogOut size={16} />
                  Logout Account
                </div>
                <FiChevronRight className="opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          </>
        ) : (
          /* FORM SUB-VIEW: EDIT DETAILS INTERACTIVE LAYOUT */
          <form onSubmit={handleUpdateDetails} className="p-8 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <button 
                type="button" 
                onClick={() => setActiveTab("menu")} 
                className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 flex items-center gap-1"
              >
                <FiArrowLeft /> Edit Account Details
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab("menu")} 
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone Number</label>
              <input 
                type="text" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping Address</label>
              <textarea 
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-800 focus:outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 transition-all shadow-md"
            >
              Save Profile Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}