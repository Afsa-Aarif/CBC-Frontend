// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function CartPage() {
  const navigate = useNavigate(); 
  const [cartItems, setCartItems] = useState([]);
  const [userStorageKey, setUserStorageKey] = useState("cart_guest");

  // 1. Establish unique storage tracking key using JWT user token info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode payload from JWT token strings securely to extract user ID info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        
        // Use unique key format tied to this specific user ID
        if (decoded && (decoded.id || decoded._id)) {
          setUserStorageKey(`cart_${decoded.id || decoded._id}`);
        }
      } catch (error) {
        console.error("Error identifying user session context token:", error);
        setUserStorageKey("cart_guest");
      }
    } else {
      setUserStorageKey("cart_guest");
    }
  }, []);

  // 2. Load custom user-scoped cart items array 
  const refreshCart = () => {
    const savedCart = localStorage.getItem(userStorageKey);
    const data = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(data);
  };

  // Trigger reloading whenever user storage channel keys change over
  useEffect(() => {
    refreshCart();
  }, [userStorageKey]);

  // Multi-Currency Converter Engine
  const formatPrice = (lkrAmount) => {
    const lkr = new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(lkrAmount);

    const gbp = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(lkrAmount / 380);

    return { lkr, gbp };
  };

  // Handle Navigation to Checkout
  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      navigate("/checkout", { state: cartItems });
    } else {
      alert("Your bag is empty!");
    }
  };

  // Handle Quantity Changes safely locked inside specific user keys
  const handleQtyChange = (item, amount) => {
    const id = item._id || item.id;
    const currentCart = [...cartItems];
    const updatedCart = currentCart.map((cartItem) => {
      const targetId = cartItem._id || cartItem.id;
      if (targetId === id) {
        const nextQty = (cartItem.quantity || 1) + amount;
        return { ...cartItem, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return cartItem;
    });

    localStorage.setItem(userStorageKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  // Handle Item Removal safely locked inside specific user keys
  const handleRemove = (item) => {
    const id = item._id || item.id;
    const currentCart = [...cartItems];
    const filteredCart = currentCart.filter((cartItem) => {
      const targetId = cartItem._id || cartItem.id;
      return targetId !== id;
    });

    localStorage.setItem(userStorageKey, JSON.stringify(filteredCart));
    setCartItems(filteredCart);
  };

  // Calculate Subtotal directly in base LKR currency from database
  const totalLKR = cartItems.reduce((acc, item) => {
    const price = item.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const finalSubtotalPrices = formatPrice(totalLKR);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-16">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Link to="/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 hover:text-rose-500 transition-colors">
              <FiArrowLeft /> Back to Shop
            </Link>
            <h1 className="text-5xl font-black text-slate-900 uppercase italic leading-none">Your Bag</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {cartItems.length} Items Selected
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State UI */
          <div className="bg-white rounded-[3.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiShoppingBag className="text-slate-200" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Your bag is empty</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Add some premium items to get started</p>
            <Link to="/products" className="inline-block px-12 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl">
              EXPLORE PRODUCTS
            </Link>
          </div>
        ) : (
          /* Cart Items List */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => {
                const itemPriceLKR = item.price || 0;
                const itemTotalPrices = formatPrice(itemPriceLKR * (item.quantity || 1));
                const targetItemId = item._id || item.id;
                
                // Clean the ID back to base form for navigation link (removes "-img-X" if present)
                const realProductId = item.originalId || (targetItemId ? String(targetItemId).split("-img-")[0] : "");

                return (
                  <div key={targetItemId || index} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Clickable Product Image Wrapper Link */}
                    <Link 
                      to={`/product/${realProductId}`} 
                      className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 block hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={item.image || (item.images && item.images[0]) || "https://placehold.co/200"} 
                        className="w-full h-full object-cover" 
                        alt={item.name} 
                      />
                    </Link>

                    {/* Clickable Info Block Label Wrapper Link */}
                    <div className="flex-1">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{item.category || 'Collection'}</span>
                      <Link to={`/product/${realProductId}`} className="block group">
                        <h3 className="font-black text-slate-900 uppercase text-sm mb-1 group-hover:text-rose-500 transition-colors">
                          {item.name || 'Product'}
                        </h3>
                      </Link>
                      <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
                        <span className="text-slate-900 font-black text-base">{itemTotalPrices.lkr}</span>
                        <span className="text-slate-400 font-bold text-[11px]">({itemTotalPrices.gbp})</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                      <button 
                        type="button"
                        onClick={() => handleQtyChange(item, -1)} 
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <FiMinus size={14}/>
                      </button>
                      <span className="px-3 font-black text-xs w-8 text-center">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => handleQtyChange(item, 1)} 
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <FiPlus size={14}/>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button 
                      type="button"
                      onClick={() => handleRemove(item)} 
                      className="p-4 text-slate-200 hover:text-rose-500 transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl lg:sticky lg:top-24">
                <h3 className="text-xl font-black uppercase italic mb-8">Summary</h3>
                
                <div className="space-y-4 mb-10 border-b border-white/10 pb-8">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Subtotal (LKR)</span>
                    <span className="text-white">{finalSubtotalPrices.lkr}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Subtotal (GBP)</span>
                    <span className="text-slate-300">{finalSubtotalPrices.gbp}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Amount</p>
                    <p className="text-3xl font-black italic text-white leading-none mb-1">{finalSubtotalPrices.lkr}</p>
                    <p className="text-xs font-bold text-slate-400">Approx. {finalSubtotalPrices.gbp}</p>
                  </div>
                </div>

                <button 
                  onClick={handleProceedToCheckout} 
                  className="w-full py-6 bg-white text-slate-900 rounded-[1.5rem] font-black hover:bg-rose-500 hover:text-white transition-all shadow-xl uppercase tracking-widest text-sm"
                >
                  Checkout Now
                </button>
                
                <p className="text-[8px] text-center text-slate-500 font-bold uppercase tracking-[0.3em] mt-6">
                  Secure Encrypted Payment
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}