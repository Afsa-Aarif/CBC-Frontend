import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiBox } from "react-icons/fi";

export default function AdminProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
                setProducts(res.data.products);
            } catch (err) {
                toast.error("Failed to sync inventory");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently remove ${name} from registry?`)) return;
        
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Product removed from market");
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            toast.error("Unauthorized or server error");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productID?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // FIXED: Formats raw file titles to resolve directly to your public Supabase Storage
    const getProductImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150";
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
            return imagePath;
        }
        return `https://jsnjgzyigzcukytqoapx.supabase.co/storage/v1/object/public/products/${imagePath}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Registry...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 pt-28 lg:pt-32">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-slate-900">Inventory</h2>
                        <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-[0.3em]">Crystal Beauty Master List</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Search SKU or Name..."
                                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64 shadow-sm transition"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => navigate("/admin/add-product")}
                            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black transition shadow-xl shadow-slate-200"
                        >
                            <FiPlus size={24}/>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Product Details</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Market Price</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Inventory</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50/50 transition group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                                <img 
                                                    src={getProductImageUrl(product.images?.[0])} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-base">{product.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-1">{product.productID || "NO SKU"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="text-sm font-black text-slate-900">LKR {product.price?.toLocaleString()}</div>
                                        {product.labelledPrice > product.price && (
                                            <div className="text-[10px] text-slate-300 line-through">LKR {product.labelledPrice?.toLocaleString()}</div>
                                        )}
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${product.stock > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <FiBox size={12}/> {product.stock} Units
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => navigate(`/admin/update-product/${product._id}`)}
                                                className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition shadow-sm"
                                            >
                                                <FiEdit2 size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product._id, product.name)}
                                                className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition shadow-sm"
                                            >
                                                <FiTrash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                        <div className="py-24 text-center">
                            <FiBox size={48} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-slate-400 text-sm italic font-medium">No products found in the current registry.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}