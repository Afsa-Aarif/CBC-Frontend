import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios"; 

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    phoneNumber: user?.phone || user?.phoneNumber || "",
    address: typeof user?.shippingAddress === 'object' ? user?.shippingAddress?.street : (user?.shippingAddress || user?.address || ""),
  });

  // Profile Image uploading states
  const [profileImage, setProfileImage] = useState(null);

  // FIX 1: Resolves correct server URL or absolute path using user.image 
  const [imagePreview, setImagePreview] = useState(() => {
    if (user?.image) {
      if (user.image.startsWith('data:image') || user.image.startsWith('http')) return user.image;
      return `${API_URL}/${user.image.replace(/^\//, '')}`;
    }
    return "https://placehold.co/150?text=Profile";
  });

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image must be smaller than 2MB");
      }
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const dataToSend = new FormData();
      dataToSend.append("firstName", formData.firstName);
      dataToSend.append("lastName", formData.lastName);
      dataToSend.append("name", `${formData.firstName} ${formData.lastName}`.trim());
      dataToSend.append("phone", formData.phoneNumber);
      dataToSend.append("phoneNumber", formData.phoneNumber);
      dataToSend.append("address", formData.address);
      
      dataToSend.append("shippingAddress", JSON.stringify({
        street: formData.address,
        city: user?.shippingAddress?.city || "Colombo",
        postalCode: user?.shippingAddress?.postalCode || "00300",
        country: user?.shippingAddress?.country || "Sri Lanka"
      }));

      // FIX 2: Appended configuration variable structure key change to match "image"
      if (profileImage) {
        dataToSend.append("image", profileImage);
      }

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
      
      const serverUpdatedUser = res.data?.user || res.data;

      localStorage.setItem("user", JSON.stringify(serverUpdatedUser));
      
      // FIX 3: Instantly trigger cross-layout navbar synchronization event updates
      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update profile data on server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-6 text-[10px] font-black uppercase tracking-widest">
          <BiArrowBack size={18}/> Back to Profile
        </button>
        
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-8">Edit Profile Details</h2>
        
        {/* AVATAR INTERACTIVE WRAPPER */}
        <div className="flex flex-col items-center mb-8">
          <div 
            onClick={handleAvatarClick}
            className="group relative w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden cursor-pointer bg-slate-100"
          >
            <img 
              src={imagePreview} 
              alt="Avatar Profile Preview" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FiCamera className="text-white" size={24} />
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden" 
          />
          <button 
            type="button"
            onClick={handleAvatarClick}
            className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-3 hover:underline"
          >
            Change Avatar Photo
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-rose-300 transition-all font-bold text-xs text-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-rose-300 transition-all font-bold text-xs text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Phone Number</label>
            <input 
              type="text" 
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-rose-300 transition-all font-bold text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Street Address</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-rose-300 transition-all font-bold text-xs text-slate-800"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-md"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}