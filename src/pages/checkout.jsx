import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegCreditCard, FaCheckCircle, FaLock, FaShieldAlt, FaTag, FaTimes } from "react-icons/fa"; 
import { BiChevronLeft, BiMoney } from "react-icons/bi";
import toast from "react-hot-toast";
import axios from "axios";
import { saveCart } from "../utils/cart";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [cart, setCart] = useState(location.state || []);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery"); 
  const [isProcessing, setIsProcessing] = useState(false);

  // --- PROMO CODE STATES ---
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/shop");
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const formatPrice = (lkrAmount) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(lkrAmount);
  };

  // --- PROMO CODE HANDLERS ---
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsValidating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
        code: promoCode,
        cartTotal: subtotal,
      });

      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setDiscountAmount(res.data.discountAmount);
        toast.success(`Promo code '${res.data.code}' applied!`);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toast.error(err.response?.data?.message || "Invalid or expired promo code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoCode("");
    toast.success("Promo code removed");
  };

  // --- PURCHASE PROCESS ---
  async function purchaseCart() {
    const token = localStorage.getItem("token"); 
    
    if (!address.trim() || !name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill all contact and shipping details");
      return;
    }

    setIsProcessing(true);

    try {
      let paymentStatus = "Pending";
      let transactionId = "N/A";

      if (paymentMethod === "Card Payment") {
        if (!stripe || !elements) {
          toast.error("Stripe gateway is not fully initialized yet.");
          setIsProcessing(false);
          return;
        }

        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/create-intent`, {
          amount: grandTotal,
        });

        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name, email, phone },
          },
        });

        if (result.error) {
          toast.error(result.error.message);
          setIsProcessing(false);
          return;
        }

        if (result.paymentIntent.status === "succeeded") {
          paymentStatus = "Paid";
          transactionId = result.paymentIntent.id;
        }
      }

      // Cleans product ID formats from text image tags before saving to MongoDB
      const items = cart.map((item) => {
        const rawId = item._id || item.id || "";
        const cleanId = rawId.split("-")[0]; 
        
        return {
          productID: cleanId,
          quantity: item.quantity,
        };
      });

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        { 
          customerName: name, 
          email, 
          phone, 
          address, 
          items, 
          subtotal,
          discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          total: grandTotal, 
          paymentMethod, 
          paymentStatus, 
          transactionId 
        },
        { timeout: 15000, ...config }
      );

      toast.success("Order Successful! Thank you.");
      saveCart([]); 
      
      navigate("/my-orders");
    } catch (error) {
      console.error("Order submission failure:", error);
      toast.error(error.response?.data?.message || "Order backend registration failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest">
            <BiChevronLeft size={20} /> Back
          </button>
          <h1 className="font-black text-xl italic uppercase tracking-tighter">Crystal<span className="text-rose-500">Beauty</span></h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <FaShieldAlt className="text-emerald-500"/> Guest & Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-2xl font-black uppercase italic mb-8 border-l-4 border-rose-500 pl-4">01. Delivery Details</h2>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 text-sm font-bold" placeholder="Full Name" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 text-sm font-bold" placeholder="Email Address" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 text-sm font-bold" placeholder="Phone Number" />
                </div>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 text-sm font-bold min-h-[120px] resize-none" placeholder="Complete Shipping Address" />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase italic mb-8 border-l-4 border-rose-500 pl-4">02. Payment</h2>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                <div onClick={() => setPaymentMethod("Cash on Delivery")} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === "Cash on Delivery" ? "border-rose-500 bg-rose-50/50" : "border-slate-50"}`}>
                  <div className="flex items-center gap-4"><BiMoney size={24} className={paymentMethod === "Cash on Delivery" ? "text-rose-500" : "text-slate-400"}/> <div><span className="font-black text-xs uppercase block">Cash on Delivery</span></div></div>
                  {paymentMethod === "Cash on Delivery" && <FaCheckCircle className="text-rose-500" />}
                </div>

                <div onClick={() => setPaymentMethod("Card Payment")} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === "Card Payment" ? "border-rose-500 bg-rose-50/50" : "border-slate-50"}`}>
                  <div className="flex items-center gap-4"><FaRegCreditCard size={20} className={paymentMethod === "Card Payment" ? "text-rose-500" : "text-slate-400"}/> <div><span className="font-black text-xs uppercase block">Card Payment</span></div></div>
                  {paymentMethod === "Card Payment" && <FaCheckCircle className="text-rose-500" />}
                </div>

                {paymentMethod === "Card Payment" && (
                    <div className="mt-6 p-8 bg-slate-900 rounded-[2rem]">
                        <div className="flex justify-between items-center mb-6"><span className="text-[10px] text-slate-400 uppercase font-black">Secure Card Entry</span><FaLock className="text-emerald-500" size={12}/></div>
                        <div className="bg-white p-5 rounded-2xl">
                            <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px', color: '#0f172a' } } }} />
                        </div>
                    </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl lg:sticky lg:top-32">
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8">Summary</h2>
              <div className="max-h-[260px] overflow-y-auto mb-6 space-y-6 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-5 items-center">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-white/10" alt="" />
                    <div className="flex-1">
                      <h3 className="text-[10px] font-black uppercase text-slate-300">{item.name}</h3>
                      <p className="text-rose-400 font-black text-xs mt-1">{formatPrice(item.price)} x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- PROMO CODE SECTION --- */}
              <div className="mb-6 border-t border-white/10 pt-6">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold tracking-wider placeholder-slate-500 focus:outline-none focus:border-rose-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isValidating}
                      className="bg-rose-600 hover:bg-rose-500 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50 flex items-center gap-1"
                    >
                      <FaTag size={10} /> {isValidating ? "Validating..." : "Apply"}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FaTag className="text-emerald-400" size={12} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{appliedCoupon.code}</p>
                        <p className="text-[9px] font-bold text-slate-300">
                          Saved {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-slate-400 hover:text-rose-400 p-1 transition"
                      title="Remove promo"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* --- PRICE BREAKDOWN --- */}
              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                    <span>Discount</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Total</span>
                  <span className="text-3xl font-black italic text-rose-500">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button onClick={purchaseCart} disabled={isProcessing} className="w-full mt-8 py-6 bg-rose-600 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-rose-500 transition-all disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}