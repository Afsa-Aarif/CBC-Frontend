import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BiArrowBack,
  BiPackage,
  BiCheckCircle,
  BiMap,
  BiPhone,
  BiCreditCard,
  BiCalendar,
  BiReceipt,
} from "react-icons/bi";
import axios from "axios";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!user.email) {
          toast.error("Please login to view your order.");
          navigate("/login");
          return;
        }

        // This endpoint will be added to your backend in the next step.
        const orderResponse = await axios.get(
          `${API_URL}/api/orders/${orderId}?email=${encodeURIComponent(user.email)}`
        );

        const fetchedOrder = orderResponse.data;
        setOrder(fetchedOrder);

        // Fetch product information for each ordered product
        if (fetchedOrder?.items?.length > 0) {
          const productResponses = await Promise.all(
            fetchedOrder.items.map(async (item) => {
              try {
                const response = await axios.get(
                  `${API_URL}/api/products/${item.productID}`
                );

                return {
                  ...response.data.product,
                  orderedQuantity: item.quantity,
                };
              } catch (error) {
                console.error(
                  `Failed to fetch product ${item.productID}:`,
                  error
                );

                return {
                  _id: item.productID,
                  name: "Product unavailable",
                  price: 0,
                  images: [],
                  orderedQuantity: item.quantity,
                };
              }
            })
          );

          setProducts(productResponses);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);

        if (error.response?.status === 404) {
          toast.error("Order not found.");
            console.log("ORDER DETAILS 404 URL:", error.config?.url);

        } else if (error.response?.status === 403) {
          toast.error("You are not allowed to view this order.");
        } else {
          toast.error("Failed to load order details.");
        }

        navigate("/my-orders");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, API_URL, navigate, user.email]);

  const formatPrice = (amount) => {
    return `LKR ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6 flex items-center justify-center">
        <p className="text-slate-400 font-black uppercase tracking-widest">
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-6 text-[10px] font-black uppercase tracking-widest"
        >
          <BiArrowBack size={18} />
          Back to Purchase History
        </button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Order Details
            </p>

            <h1 className="text-3xl md:text-4xl font-black uppercase italic text-slate-900">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs">
            <BiCheckCircle size={20} />
            {order.status || "Order Placed"}
          </div>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Order Date */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <BiCalendar size={22} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Order Date
              </p>
            </div>

            <p className="font-black text-slate-900">
              {formatDate(order.date)}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <BiCreditCard size={22} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Payment
              </p>
            </div>

            <p className="font-black text-slate-900">
              {order.paymentMethod || "N/A"}
            </p>

            <p className="text-xs font-bold text-emerald-500 mt-1">
              {order.paymentStatus || "Pending"}
            </p>
          </div>

          {/* Transaction */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <BiReceipt size={22} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Transaction
              </p>
            </div>

            <p className="font-black text-slate-900 text-sm break-all">
              {order.transactionId || "N/A"}
            </p>
          </div>
        </div>

        {/* Ordered Products */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BiPackage size={25} className="text-slate-400" />

            <h2 className="text-xl font-black uppercase italic text-slate-900">
              Ordered Products
            </h2>
          </div>

          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="flex flex-col sm:flex-row gap-5 p-4 bg-slate-50 rounded-2xl"
              >
                {/* Product Image */}
                <div className="w-full sm:w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <BiPackage size={35} className="text-slate-300" />
                  )}
                </div>

                {/* Product Information */}
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Product
                  </p>

                  <h3 className="text-lg font-black uppercase italic text-slate-900 mt-1">
                    {product.name}
                  </h3>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <p className="text-sm font-bold text-slate-500">
                      Price:{" "}
                      <span className="text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                    </p>

                    <p className="text-sm font-bold text-slate-500">
                      Quantity:{" "}
                      <span className="text-slate-900">
                        {product.orderedQuantity}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Item Total */}
                <div className="sm:text-right flex sm:block items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Item Total
                  </p>

                  <p className="text-lg font-black text-slate-900 mt-1">
                    {formatPrice(
                      Number(product.price || 0) *
                        Number(product.orderedQuantity || 0)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary + Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Order Summary */}
          <div className="bg-slate-900 rounded-[2rem] p-7 md:p-8 text-white shadow-xl">
            <h2 className="text-xl font-black uppercase italic mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between text-sm font-bold text-slate-300">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-sm font-bold text-emerald-400">
                  <span>
                    Discount
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>

                  <span>
                    - {formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-white/10 pt-5 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Total
                </span>

                <span className="text-3xl font-black italic text-rose-400">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-[2rem] p-7 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BiMap size={25} className="text-slate-400" />

              <h2 className="text-xl font-black uppercase italic text-slate-900">
                Delivery Information
              </h2>
            </div>

            <div className="space-y-5">

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Customer
                </p>

                <p className="font-black text-slate-900 mt-1">
                  {order.customerName}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <BiPhone className="text-slate-400" />

                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Phone
                  </p>
                </div>

                <p className="font-bold text-slate-900 mt-1">
                  {order.phone}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Delivery Address
                </p>

                <p className="font-bold text-slate-700 mt-1 leading-relaxed">
                  {order.address}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Order Status
                </p>

                <div className="flex items-center gap-2 mt-2 text-emerald-500 font-black uppercase text-sm">
                  <BiCheckCircle size={20} />
                  {order.status || "Order Placed"}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}