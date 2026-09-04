import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader } from "../components/loader";
import { FiChevronRight, FiHeart, FiStar, FiX, FiChevronLeft } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";

export default function ProductOverview() {
    const { id } = useParams();
    
    // --- State Management ---
    const [status, setStatus] = useState("loading");
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Lightbox Zoom Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalActiveIndex, setModalActiveIndex] = useState(0);

    // Review Form States
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Infinite Feed Recommendations State
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const SUPABASE_STORAGE_URL = "https://jsnjgzyigzcukytqoapx.supabase.co/storage/v1/object/public/products/";
    
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token"); 
    const userEmail = userData.email; 
    const currentUsername = userData.name || userData.username || "Verified Buyer";

    const checkWishlistStatus = useCallback(async (email, productId) => {
        try {
            const res = await axios.get(`${API_URL}/api/wishlist/${email}`);
            const exists = res.data.products?.some(p => 
                (p.productID?._id === productId) || (p.productID === productId)
            );
            setIsWishlisted(exists);
        } catch (err) { 
            console.error("Wishlist Check Error:", err); 
        }
    }, [API_URL]);

    const fetchRecommendations = useCallback(async (category, excludeId) => {
        try {
            setIsLoadingRecommendations(true);
            const res = await axios.get(`${API_URL}/api/products/recommendations/explore`, {
                params: { category, exclude: excludeId }
            });
            if (res.data?.success) {
                setRecommendedProducts(res.data.products);
            }
        } catch (err) {
            console.error("Recommendations Fetch Error:", err);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setStatus("loading");
                const res = await axios.get(`${API_URL}/api/products/${id}`, { timeout: 10000 });
                const data = res.data?.product || res.data; 

                if (data && (data._id || data.id)) {
                    setProduct(data);
                    setStatus("success");
                    setSelectedImage(0);
                    if (userEmail) {
                        checkWishlistStatus(userEmail, data._id || data.id);
                    }
                    fetchRecommendations(data.category, data._id || data.id);
                } else {
                    setStatus("error");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setStatus("error");
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id, API_URL, userEmail, checkWishlistStatus, fetchRecommendations]);

    const gallery = useMemo(() => {
        const rawImages = product?.images && product.images.length > 0 
            ? product.images 
            : [product?.image || ""];

        return rawImages.map(img => {
            if (!img) return "https://placehold.co/800x800?text=No+Image";
            if (img.startsWith("http")) return img;
            return `${SUPABASE_STORAGE_URL}${img}`;
        });
    }, [product, SUPABASE_STORAGE_URL]);

    const handleWishlistToggle = async () => {
        if (!userEmail) { 
            toast.error("Please login to save favorites!"); 
            return; 
        }
        try {
            const res = await axios.post(`${API_URL}/api/wishlist/toggle`, {
                email: userEmail,
                productID: product._id || product.id
            });
            const exists = res.data.products?.some(p => 
                (p.productID?._id === (product._id || product.id)) || (p.productID === (product._id || product.id))
            );
            setIsWishlisted(exists);
            toast.success(exists ? "Added to wishlist!" : "Removed from wishlist");
        } catch (err) { 
            toast.error("Wishlist update failed"); 
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!userEmail) {
            toast.error("You must be logged in to leave a review!");
            return;
        }
        if (!newComment.trim()) {
            toast.error("Please add a comment before submitting.");
            return;
        }

        try {
            setIsSubmittingReview(true);
            const targetId = product._id || product.id;

            const config = {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ""
                }
            };

            const res = await axios.post(
                `${API_URL}/api/products/${targetId}/review`, 
                {
                    username: currentUsername,
                    email: userEmail,
                    rating: newRating,
                    comment: newComment
                },
                config
            );

            if (res.data?.success) {
                toast.success("Review posted successfully!");
                setProduct(res.data.product); 
                setNewComment(""); 
                setNewRating(5); 
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || "Could not save review feedback.";
            toast.error(errMsg);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const openZoomModal = (index) => {
        setModalActiveIndex(index);
        setIsModalOpen(true);
    };

    if (status === "loading") {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <Loader />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing Product...</p>
            </div>
        );
    }
    
    if (status === "error" || !product) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
                <h1 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Product Not Found</h1>
                <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest font-bold">The product may have been moved or the server is offline.</p>
                <Link to="/products" className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg hover:bg-rose-500 transition-all">
                    RETURN TO SHOP
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-white text-slate-900 pb-20 pt-24">
            <div className="max-w-7xl mx-auto px-6 py-4">
                
                {/* --- BREADCRUMB NAVIGATION --- */}
                <nav className="flex items-center gap-2 text-[10px] text-slate-400 mb-6 uppercase tracking-widest font-bold">
                    <Link to="/products" className="hover:text-slate-900">Products</Link> 
                    <FiChevronRight size={10}/>
                    <span className="text-slate-900">{product?.category || "Beauty"}</span>
                </nav>

                {/* --- TOP SECTION: HERO OVERVIEW SPLIT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-start">
                    
                    {/* Hero Left Side */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div 
                            onClick={() => openZoomModal(selectedImage)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 h-[500px] flex items-center justify-center overflow-hidden relative cursor-zoom-in group"
                        >
                            <img 
                                src={gallery[selectedImage]} 
                                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.01]" 
                                alt={product?.name} 
                            />
                        </div>

                        {/* Horizontal Alternate Navigation Row */}
                        {gallery.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-thin">
                                {gallery.map((img, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedImage(i)}
                                        onMouseEnter={() => setSelectedImage(i)} 
                                        className={`w-20 h-20 rounded-xl border-2 transition-all overflow-hidden flex-shrink-0 bg-slate-50 p-1 ${
                                            selectedImage === i ? 'border-orange-500 scale-102 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt={`view-${i}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hero Right Side */}
                    <div className="lg:col-span-5 px-2 lg:sticky lg:top-28">
                        <h1 className="text-3xl font-black text-slate-900 uppercase italic mb-3 leading-tight tracking-wide">
                            {product?.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.round(product?.rating || 5) ? "fill-current" : "text-slate-200"} size={13} />
                                ))}
                            </div>
                            <span className="text-xs font-black text-slate-500">
                                {product?.rating || "5.0"} ({product?.reviewsCount || product?.reviews?.length || 0} reviews)
                            </span>
                        </div>

                        <div className="text-3xl font-black text-orange-600 mb-8">
                            Rs.{product?.price?.toLocaleString()}
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[2.5rem] mb-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center bg-white rounded-xl border border-slate-200 px-1">
                                    <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="p-2 px-3 font-bold text-slate-400 hover:text-slate-900 text-lg">-</button>
                                    <span className="px-3 font-black w-10 text-center text-sm">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q+1)} className="p-2 px-3 font-bold text-slate-400 hover:text-slate-900 text-lg">+</button>
                                </div>
                                <button 
                                    onClick={handleWishlistToggle} 
                                    className={`p-3 rounded-xl transition-all shadow-sm border ${
                                        isWishlisted ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-200 text-slate-300'
                                    }`}
                                >
                                    {isWishlisted ? <FaHeart size={16} /> : <FiHeart size={16} />}
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => { 
                                    const baseId = product._id || product.id;
                                    const variantCartId = `${baseId}-img-${selectedImage}`;

                                    const cartItem = {
                                        ...product,
                                        originalId: baseId, 
                                        _id: variantCartId,
                                        id: variantCartId,
                                        image: gallery[selectedImage],
                                        quantity: quantity
                                    };

                                    // FIX ALIGNMENT: Determine Storage Key scoped to logged-in user JWT ID
                                    let activeStorageKey = "cart_guest";
                                    const userToken = localStorage.getItem("token");
                                    if (userToken) {
                                        try {
                                            const base64Url = userToken.split('.')[1];
                                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                            const decoded = JSON.parse(window.atob(base64));
                                            if (decoded && (decoded.id || decoded._id)) {
                                                activeStorageKey = `cart_${decoded.id || decoded._id}`;
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }

                                    // Read existing array items, push/merge modifications, and write back safely
                                    const currentCartItems = JSON.parse(localStorage.getItem(activeStorageKey) || "[]");
                                    const existingItemIndex = currentCartItems.findIndex(i => (i._id === variantCartId || i.id === variantCartId));
                                    
                                    if (existingItemIndex > -1) {
                                        currentCartItems[existingItemIndex].quantity += quantity;
                                    } else {
                                        currentCartItems.push(cartItem);
                                    }

                                    localStorage.setItem(activeStorageKey, JSON.stringify(currentCartItems));
                                    toast.success("Added to bag!"); 
                                }} 
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm tracking-wider hover:bg-orange-500 transition-all shadow-md"
                            >
                                ADD TO SHOPPING BAG
                            </button>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                {product?.description || "Premium formula crafted for luxury results."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- MIDDLE SECTION: DETAILED IMAGES --- */}
                <div className="w-full mt-28 mb-20 border-t border-slate-100 pt-16">
                    <div className="text-center mb-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Product Details</h2>
                        <p className="text-2xl font-black uppercase italic text-slate-900">A Closer Look</p>
                    </div>
                    
                    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
                        {gallery.map((img, index) => (
                            <div 
                                key={`showcase-${index}`}
                                onClick={() => openZoomModal(index)}
                                className="w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-4 cursor-zoom-in group transition-all hover:shadow-md"
                            >
                                <img 
                                    src={img} 
                                    alt={`Product details view ${index + 1}`} 
                                    className="w-full h-auto max-h-[800px] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.01]"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- BOTTOM SECTION: REVIEWS --- */}
                <div className="mt-20 border-t border-slate-100 pt-12">
                    <h2 className="text-xl font-black uppercase italic mb-8 tracking-wide text-slate-900">Customer Feedbacks ({product?.reviews?.length || 0})</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-slate-800">Write a review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((starValue) => (
                                            <button
                                                type="button"
                                                key={starValue}
                                                onClick={() => setNewRating(starValue)}
                                                className="text-lg transition-transform hover:scale-125 focus:outline-none"
                                            >
                                                {starValue <= newRating ? <FaStar className="text-amber-400" /> : <FiStar className="text-slate-300" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Comment Description</label>
                                    <textarea
                                        rows="3"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-900 font-medium"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all disabled:opacity-50"
                                >
                                    {isSubmittingReview ? "Posting..." : "Submit Review"}
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-7 space-y-4 max-h-[450px] overflow-y-auto pr-2">
                            {product?.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((rev) => (
                                    <div key={rev._id || Math.random()} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">{rev.username}</h4>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                    {new Date(rev.createdAt || Date.now()).toLocaleDateString("en-LK", { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, index) => (
                                                    <FaStar key={index} className={index < rev.rating ? "fill-current" : "text-slate-100"} size={10} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-xs leading-relaxed font-medium">{rev.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No reviews written for this product yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER: RECOMMENDATIONS --- */}
                <div className="mt-24 border-t border-slate-100 pt-12">
                    <div className="mb-8 pl-3 border-l-4 border-slate-900">
                        <h2 className="text-xl font-black uppercase italic tracking-wide text-slate-900">Explore Your Interests</h2>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Customers who viewed this item were also hooked on these essentials</p>
                    </div>

                    {isLoadingRecommendations ? (
                        <div className="flex justify-center py-12">
                            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {recommendedProducts.map((item) => {
                                const rImg = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "");
                                const finalImg = rImg.startsWith("http") ? rImg : rImg ? `${SUPABASE_STORAGE_URL}${rImg}` : "https://placehold.co/400x500?text=No+Image";
                                
                                return (
                                    <Link 
                                        to={`/product/${item._id}`} 
                                        key={item._id}
                                        className="group flex flex-col bg-slate-50 p-2 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg"
                                    >
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white relative">
                                            <img src={finalImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                                        </div>
                                        <div className="mt-3 px-1">
                                            <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-0.5">{item.name}</h4>
                                            <div className="flex items-center gap-1 mb-1">
                                                <FiStar className="text-amber-400 fill-current" size={9} />
                                                <span className="text-[9px] font-black text-slate-500">{item.rating || "5.0"}</span>
                                            </div>
                                            <span className="text-xs font-black italic text-slate-900">Rs.{item.price?.toLocaleString()}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* --- LIGHTBOX MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
                    >
                        <FiX size={24} />
                    </button>

                    <div className="relative max-w-4xl max-h-[75vh] w-full flex items-center justify-center px-12">
                        <img 
                            src={gallery[modalActiveIndex]} 
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                            alt="Expanded layout display" 
                        />

                        {gallery.length > 1 && (
                            <>
                                <button 
                                    onClick={() => setModalActiveIndex(prev => (prev === 0 ? gallery.length - 1 : prev - 1))}
                                    className="absolute left-0 p-3 rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/70 transition-colors"
                                >
                                    <FiChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={() => setModalActiveIndex(prev => (prev === gallery.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-0 p-3 rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/70 transition-colors"
                                >
                                    <FiChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {gallery.length > 1 && (
                        <div className="absolute bottom-6 flex justify-center gap-3 w-full px-6 overflow-x-auto scrollbar-none">
                            {gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setModalActiveIndex(idx)}
                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-white p-0.5 ${
                                        modalActiveIndex === idx ? "border-orange-500 scale-105 shadow" : "border-transparent opacity-50"
                                    }`}
                                >
                                    <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="Thumbnail reference" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}