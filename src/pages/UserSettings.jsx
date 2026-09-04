import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiArrowBack, BiUser, BiShieldQuarter, BiSave } from "react-icons/bi";
import { FiMail, FiPhone, FiMapPin, FiUserCheck } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

export default function UserSettings() {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState(null);
    const [localBase64Image, setLocalBase64Image] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { 
            toast.error("Session expired. Please log in again.");
            navigate("/login"); 
            return; 
        }

        axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            const data = res.data?.user || res.data;
            setUser(data);
            setFirstName(data.firstName || data.name?.split(" ")[0] || "");
            setLastName(data.lastName || data.name?.split(" ").slice(1).join(" ") || "");
            setEmail(data.email || "");
            setPhone(data.phone || data.phoneNumber || "");
            setAddress(typeof data.shippingAddress === 'object' ? data.shippingAddress?.street : (data.shippingAddress || data.address || ""));
            setFetching(false);
        })
        .catch(() => {
            const localSavedUser = localStorage.getItem("user");
            if (localSavedUser) {
                const parsedUser = JSON.parse(localSavedUser);
                setUser(parsedUser);
                setFirstName(parsedUser.firstName || parsedUser.name?.split(" ")[0] || "");
                setLastName(parsedUser.lastName || parsedUser.name?.split(" ").slice(1).join(" ") || "");
                setEmail(parsedUser.email || "");
                setPhone(parsedUser.phone || parsedUser.phoneNumber || "");
                setAddress(typeof parsedUser.shippingAddress === 'object' ? parsedUser.shippingAddress?.street : (parsedUser.shippingAddress || parsedUser.address || ""));
                if (parsedUser.image) {
                    setLocalBase64Image(parsedUser.image);
                }
            }
            setFetching(false);
        });
    }, [navigate, API_URL]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 400; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); 
                setLocalBase64Image(compressedBase64);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        
        try {
            let res;
            if (image) {
                const formData = new FormData();
                formData.append("firstName", firstName);
                formData.append("lastName", lastName);
                formData.append("name", `${firstName} ${lastName}`.trim());
                formData.append("email", email);
                formData.append("phone", phone);
                formData.append("address", address);
                formData.append("image", image);

                res = await axios.put(`${API_URL}/api/users/me`, formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data" 
                    },
                });
            } else {
                const payload = {
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`.trim(),
                    email,
                    phone,
                    address,
                    shippingAddress: {
                        street: address,
                        city: user?.shippingAddress?.city || "Colombo",
                        postalCode: user?.shippingAddress?.postalCode || "00300",
                        country: user?.shippingAddress?.country || "Sri Lanka"
                    }
                };
                res = await axios.put(`${API_URL}/api/users/me`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            
            const updatedProfile = res.data?.user || res.data;
            localStorage.setItem("user", JSON.stringify(updatedProfile));
            
            // FIX: Dispatches userUpdated custom event instantly for the navbar
            window.dispatchEvent(new Event("userUpdated"));
            
            toast.success("Profile saved successfully!");
            navigate("/profile");
        } catch (err) {
            console.error("Failed to save profile parameters on server:", err);
            toast.error("Failed to sync structural profile values.");
        } finally {
            setLoading(false);
        }
    };

    const imagePreview = useMemo(() => {
        if (localBase64Image) return localBase64Image;
        if (user?.image) {
            if (user.image.startsWith('data:image') || user.image.startsWith('http')) return user.image;
            return `${API_URL}/${user.image.replace(/^\//, '')}`;
        }
        return null;
    }, [localBase64Image, user, API_URL]);

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-xs tracking-widest text-slate-400 uppercase">
                Syncing Control Metrics...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate('/profile')} className="mb-8 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                    <BiArrowBack size={18}/> Return to Account Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Avatar Management</p>
                        
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-900 mb-6 border-4 border-white shadow-xl shadow-slate-200 relative group flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" alt="User Profile" />
                            ) : (
                                <BiUser size={48} className="text-white opacity-80"/>
                            )}
                        </div>

                        <label className="cursor-pointer bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-md">
                            Upload New Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="text-[10px] text-slate-400 font-bold mt-3">JPG, PNG or WEBP.</p>

                        <div className="w-full border-t border-slate-100 mt-8 pt-6 space-y-3 text-left">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <FiUserCheck className="text-slate-400"/> Status: <span className="text-emerald-500 font-black">Active</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <BiShieldQuarter className="text-slate-400"/> Role: <span className="text-slate-800 font-black uppercase">{user?.role || "Customer"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-base font-black uppercase tracking-tight text-slate-900 mb-8 flex items-center gap-2">
                                <BiUser className="text-rose-500" size={20}/> Primary Profile Details
                            </h3>
                            
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">First Name</label>
                                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-rose-300 transition-all" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Name</label>
                                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full mt-1 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-rose-300 transition-all" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
                                        <div className="relative mt-1 flex items-center">
                                            <FiMail className="absolute left-4 text-slate-400" size={16}/>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-rose-300 transition-all" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Connection</label>
                                        <div className="relative mt-1 flex items-center">
                                            <FiPhone className="absolute left-4 text-slate-400" size={16}/>
                                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-rose-300 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Default Delivery Address String</label>
                                    <div className="relative mt-1 flex items-start">
                                        <FiMapPin className="absolute left-4 top-4 text-slate-400" size={16}/>
                                        <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-rose-300 transition-all resize-none" placeholder="Provide street details..." />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                    <BiSave size={16}/> {loading ? "Saving Parameters..." : "Save Configuration Profile"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}