import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { FiUploadCloud, FiX, FiArrowLeft, FiPlusCircle } from "react-icons/fi";
import mediaUpload from "../../utils/mediaUpload";

export default function AddProductPage() {
    const [formData, setFormData] = useState({
        productID: "", 
        name: "", 
        description: "",
        usage: "", 
        shippingInfo: "", 
        price: 0, 
        labelledPrice: 0, 
        category: "Skincare", 
        stock: 0
    });
    
    const [featureInput, setFeatureInput] = useState("");
    const [features, setFeatures] = useState(["Vegan", "Cruelty Free", "Dermatologically Tested"]);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setImages([...images, ...files]);
        setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput("");
        }
    };

    async function addProduct() {
        const token = localStorage.getItem("token");
        if (!formData.productID || !formData.name) return toast.error("SKU and Name are required");
        if (images.length === 0) return toast.error("Please upload at least one image");

        setIsLoading(true);
        try {
            toast.loading("Uploading images to Supabase...", { id: "uploading" });
            
            const uploadedImageUrls = [];
            for (const file of images) {
                const url = await mediaUpload(file);
                uploadedImageUrls.push(url);
            }

            toast.success("Images synced to cloud!", { id: "uploading" });

            const payload = {
                ...formData,
                features: features,
                images: uploadedImageUrls 
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json" 
                }
            });

            toast.success(`${formData.name} Sync Success!`);
            navigate("/admin/products");
        } catch (error) {
            console.error("Cloud Sync Error Details:", error);
            toast.error("Cloud Sync Failed. Check Supabase 'products' bucket permissions.", { id: "uploading" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 pt-28 lg:pt-32">
            <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-xs font-bold transition">
                            <FiArrowLeft /> BACK TO LIST
                        </button>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">New Registry Entry</h2>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="SKU / Product ID" name="productID" placeholder="CBC-001" onChange={handleInputChange} />
                            <Input label="Product Name" name="name" placeholder="Glow Serum" onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Sale Price" name="price" type="number" onChange={handleInputChange} />
                            <Input label="Label Price" name="labelledPrice" type="number" onChange={handleInputChange} />
                            <Input label="Stock" name="stock" type="number" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea name="description" rows="5" onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Media Gallery</label>
                        
                        {/* Hidden Native Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            multiple 
                            className="hidden" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                        />

                        {/* Clickable Card Area */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-3xl h-36 flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer"
                        >
                            <FiUploadCloud size={32} className="text-slate-300 mb-2 pointer-events-none" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                                Upload
                            </p>
                        </div>

                        {/* Image Previews */}
                        <div className="grid grid-cols-3 gap-2">
                            {previews.map((url, i) => (
                                <div key={i} className="relative aspect-square">
                                    <img src={url} className="w-full h-full rounded-xl object-cover border" alt="preview" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(i)} 
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <FiX size={8}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Badges</label>
                            <div className="flex gap-2">
                                <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs h-10 outline-none" placeholder="Add..." />
                                <button onClick={addFeature} type="button" className="text-slate-900"><FiPlusCircle size={24}/></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-10 pb-10 flex justify-end">
                    <button onClick={addProduct} disabled={isLoading} className="bg-slate-900 text-white px-16 py-6 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl disabled:bg-slate-200">
                        {isLoading ? "SYNCING..." : "SYNC TO MARKET"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <input {...props} className="bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none" />
    </div>
);