// src/components/productCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  if (!product) return null;

  const price = Number(product.price) || 0;
  const labelledPrice = Number(product.labelledPrice) || price;
  const productName = product.name || "Luxury Beauty Item";
  const displayID = product.productID || "N/A";
  const category = product.category || "Luxury";
  
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://placehold.co/400x500?text=Crystal+Beauty";

  const hasDiscount = labelledPrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((labelledPrice - price) / labelledPrice) * 100) 
    : 0;

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="group relative w-full max-w-[280px] bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden p-4 text-left"
    >
      {/* Visual Image Display Frame */}
      <div className="w-full h-[240px] rounded-[1.5rem] overflow-hidden bg-slate-50 relative">
        <img 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
          src={imageUrl} 
          alt={productName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x500?text=Crystal+Beauty";
          }}
        />

        {/* Dynamic Promotional Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md z-10">
            Save {discountPercent}%
          </div>
        )}
        
        {/* Secondary Category Overlay Tag */}
        <span className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md text-slate-800 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 z-10">
          {category}
        </span>
      </div>

      {/* Product Information Context Panel */}
      <div className="flex flex-col flex-grow pt-4 pb-1 px-1">
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
          ID: {displayID}
        </span>

        <h1 className="text-sm font-black text-slate-800 tracking-tight mt-1 line-clamp-1 group-hover:text-rose-500 transition-colors">
          {productName}
        </h1>

        {/* Price Configuration Module */}
        <div className="mt-2 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xs text-slate-400 font-bold line-through">
                LKR {labelledPrice.toFixed(2)}
              </span>
              <span className="text-sm text-rose-500 font-black tracking-tight">
                LKR {price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-900 font-black tracking-tight">
              LKR {price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}