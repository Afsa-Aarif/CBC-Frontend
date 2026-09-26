// src/pages/adminUpdateProduct.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { MdOutlineSave, MdArrowBack, MdImage, MdCloudUpload } from "react-icons/md";
import { FiX, FiPlusCircle } from "react-icons/fi";
import mediaUpload from "../../utils/mediaUpload";

export default function AdminProductUpdatePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        productID: "",
        name: "",
        description: "",
        usage: "",
        price: 0,
        labelledPrice: 0,
        stock: 0,
        soldCount: 0,
        category: "Skincare",
        shippingInfo: ""
    });

    const [features, setFeatures] = useState([]);
    const [featureInput, setFeatureInput] = useState("");
    const [altNames, setAltNames] = useState([]);
const [altNameInput, setAltNameInput] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
                const p = res.data.product || res.data.data || res.data;
                setFormData({
                    productID: p.productID || "",
                    name: p.name || "",
                    description: p.description || "",
                    usage: p.usage || "",
                    price: p.price || 0,
                    labelledPrice: p.labelledPrice || 0,
                    stock: p.stock || 0,
                    soldCount: p.soldCount || 0,
                    category: p.category || "Skincare",
                    shippingInfo: p.shippingInfo || ""
                });
                setFeatures(p.features || []);
setAltNames(p.altNames || []);
setExistingImages(p.images || []);
                setIsLoadingData(false);
            } catch (err) {
                console.error("Error loading product:", err);
                toast.error("Failed to load product data");
                navigate("/admin/products");
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages([...newImages, ...files]);
        setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeNewImage = (index) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput("");
        }
    };
    const addAlternativeName = () => {
    const name = altNameInput.trim();

    if (!name) return;

    if (altNames.includes(name)) {
        toast.error("This alternative name already exists");
        return;
    }

    setAltNames([...altNames, name]);
    setAltNameInput("");
};

const removeAlternativeName = (index) => {
    setAltNames(altNames.filter((_, i) => i !== index));
};

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            return toast.error("Description is required before saving!");
        }

        setIsUpdating(true);
        const token = localStorage.getItem("token");

        try {
            let uploadedUrls = [];
            if (newImages.length > 0) {
                uploadedUrls = await Promise.all(newImages.map(img => mediaUpload(img)));
            }

         const finalData = {
    ...formData,
    altNames: altNames,
    features: features,
    images: [...existingImages, ...uploadedUrls]
};

            await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, finalData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Product updated successfully!");
            navigate("/admin/products");
        } catch (err) {
            console.error("UPDATE ERROR:", err);
            toast.error(err.response?.data?.message || "Failed to update product");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoadingData) return <div className="pt-40 text-center font-bold">Retrieving Product Data...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-xs uppercase tracking-widest">
                        <MdArrowBack /> Back to Inventory
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-gray-900 italic">Edit Product</h1>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em]">Registry Update Panel</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="SKU / Product ID" value={formData.productID} onChange={(e) => setFormData({...formData, productID: e.target.value})} />
                            <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        {/* Alternative Names */}
<div className="space-y-3">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Alternative Names
    </label>

    <div className="flex gap-2">
        <input
            type="text"
            value={altNameInput}
            onChange={(e) => setAltNameInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addAlternativeName();
                }
            }}
            placeholder="e.g. CeraVe Face Wash"
            className="flex-1 bg-gray-50 border border-gray-100 h-12 rounded-2xl px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
        />

        <button
            type="button"
            onClick={addAlternativeName}
            className="px-5 rounded-2xl bg-indigo-900 text-white hover:bg-black transition"
        >
            <FiPlusCircle size={20} />
        </button>
    </div>

    {altNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {altNames.map((name, index) => (
                <span
                    key={index}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-full text-xs font-semibold"
                >
                    {name}

                    <button
                        type="button"
                        onClick={() => removeAlternativeName(index)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FiX size={14} />
                    </button>
                </span>
            ))}
        </div>
    )}
</div>

<div className="grid grid-cols-4 gap-4">
    <Input label="Sale Price (LKR)" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
    <Input label="Label Price (LKR)" type="number" value={formData.labelledPrice} onChange={(e) => setFormData({...formData, labelledPrice: e.target.value})} />
    <Input label="Stock Level" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
    <Input label="Sold Quantity" type="number" value={formData.soldCount} onChange={(e) => setFormData({...formData, soldCount: e.target.value})} />
</div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                rows="5"
                                placeholder="Enter product details..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border ${!formData.description ? 'border-red-200' : 'border-gray-100'} focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm leading-relaxed`}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Usage Ritual</label>
                            <textarea 
                                rows="3"
                                value={formData.usage}
                                onChange={(e) => setFormData({...formData, usage: e.target.value})}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm italic"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                <MdImage className="text-indigo-500" size={18}/> Product Gallery
                            </h3>
                            <div className="border-2 border-dashed border-gray-100 rounded-3xl p-6 text-center relative hover:bg-indigo-50 transition-all cursor-pointer mb-4">
                                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                                <MdCloudUpload size={30} className="mx-auto text-indigo-300 mb-1" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Upload More</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {existingImages.map((img, i) => {
                                    const imageSrc = img.startsWith("http") 
                                        ? img 
                                        : `https://jsnjgzyigzcukytqoapx.supabase.co/storage/v1/object/public/products/${img}`;

                                    return (
                                        <div key={`ex-${i}`} className="relative group aspect-square">
                                            <img src={imageSrc} className="w-full h-full object-cover rounded-xl border border-gray-200" alt="Product thumbnail" />
                                            <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={10}/></button>
                                        </div>
                                    );
                                })}
                                {previews.map((url, i) => (
                                    <div key={`new-${i}`} className="relative group aspect-square">
                                        <img src={url} className="w-full h-full object-cover rounded-xl border-2 border-indigo-400" alt="New upload preview" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"><FiX size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Product Badges</label>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    value={featureInput} 
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-100 h-10 rounded-xl px-4 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Add: Vegan, etc."
                                />
                                <button type="button" onClick={addFeature} className="text-indigo-600"><FiPlusCircle size={28}/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {features.map((f, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-2">
                                        {f} <FiX className="cursor-pointer text-red-400" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}/>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="w-full bg-indigo-900 hover:bg-black text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isUpdating ? "Saving Changes..." : <><MdOutlineSave size={20}/> Save All Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <input {...props} className="bg-gray-50 border border-gray-100 h-12 rounded-2xl px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
    </div>
);