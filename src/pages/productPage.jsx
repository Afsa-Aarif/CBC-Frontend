// src/pages/productPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ProductCard from "../components/productCard.jsx";
import { FaTag, FaBullhorn, FaCheck, FaSearch, FaTimes } from "react-icons/fa";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const SUPABASE_PROJECT_ID = "jsnjgzyigzcukytqoapx";
  const SUPABASE_BUCKET_NAME = "products";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch products
        const productRes = await axios.get(`${API_URL}/api/products`);
        const fetchedData =
          productRes.data?.products ||
          productRes.data?.data ||
          (Array.isArray(productRes.data) ? productRes.data : []);
        setProducts(fetchedData);

        // 2. Fetch active promotions
        try {
          const promoRes = await axios.get(`${API_URL}/api/coupons/public/active`);
          if (Array.isArray(promoRes.data)) {
            setPromotions(promoRes.data);
          }
        } catch (promoErr) {
          console.warn("Could not load promotions:", promoErr);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // 💡 Fixed: Run once on mount

  // Copy promo code handler
  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    }
  };

  // Helper utility function to parse raw file names or full paths into Supabase URLs
  const getCleanImageUrl = (rawPath) => {
    if (!rawPath) return "https://placehold.co/400x500?text=No+Image";
    if (
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("data:")
    ) {
      return rawPath;
    }
    return `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${rawPath}`;
  };

  // Dynamically extract unique categories
  const categoriesList = useMemo(() => {
    if (products.length === 0) return [{ name: "All", image: "" }];

    const uniqueNames = [
      "All",
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return uniqueNames.map((catName) => {
      if (catName === "All") return { name: "All", image: "" };

      const match = products.find((p) => p.category === catName);
      const rawImg =
        match && Array.isArray(match.images) && match.images.length > 0
          ? match.images[0]
          : match?.image || "";

      const finalImg = getCleanImageUrl(rawImg);

      return {
        name: catName,
        image:
          finalImg ||
          "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=150&auto=format&fit=crop",
      };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
        // Category matching
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        // If search is empty, don't filter by search
        if (!query) {
            return matchesCategory;
        }

        // Official product name
        const productName =
            product.name?.toLowerCase() || "";

        // Alternative names
        const alternativeNames = Array.isArray(product.altNames)
            ? product.altNames
                  .filter(Boolean)
                  .map((name) => name.toLowerCase())
            : [];

        // Search official name OR alternative names
        const matchesSearch =
            productName.includes(query) ||
            alternativeNames.some((name) => name.includes(query));

        return matchesCategory && matchesSearch;
    });
}, [products, selectedCategory, searchTerm]);
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20">
      <div className="max-w-7xl mx-auto px-4 mt-12">
        {/* Header Section */}
        <div className="mb-6 border-l-4 border-slate-900 pl-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">
              Global Trends
            </h2>
           <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-2">
    {searchTerm.trim()
        ? `${filteredProducts.length} ${
              filteredProducts.length === 1 ? "Product" : "Products"
          } Found for "${searchTerm.trim()}"`
        : `Selected Premium Essentials • ${filteredProducts.length} Items Displayed`}
</p>
          </div>
        </div>
        {/* Elegant Product Search */}
<div className="mb-10">
    <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:shadow-xl">
            
         <div className="pl-5 text-slate-400">
    <FaSearch size={16} />
</div>
            {/* Search Input */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands or alternative names..."
                className="w-full h-14 px-4 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />

            {/* Clear Button */}
            {searchTerm && (
                <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mr-3 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-200 flex items-center justify-center font-bold"
                    aria-label="Clear search"
                >
                  <FaTimes size={13} />
                </button>
            )}
        </div>

        {/* Search Hint */}
        <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Search by
            </span>

            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Product Name
            </span>

            <span className="text-slate-300">•</span>

            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Alternative Name
            </span>
        </div>
    </div>
</div>

        {/* PROMOTION ANNOUNCEMENT BANNER SECTION */}
        {promotions.length > 0 && (
          <div className="mb-10 space-y-3">
            {promotions.map((promo) => {
              const minSpend = promo.minPurchase || promo.minOrderAmount || 0;
              const isCopied = copiedCode === promo.code;

              return (
                <div
                  key={promo._id}
                  className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-5 text-white shadow-lg shadow-rose-200/50 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
                      <FaBullhorn size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white text-rose-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                          Special Offer
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-rose-100 flex items-center gap-1">
                          <FaTag size={10} /> Use Code:{" "}
                          <span className="underline decoration-white font-black text-white">
                            {promo.code}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm font-bold mt-1 text-white">
                        Get{" "}
                        <span className="font-black italic text-yellow-300">
                          {promo.discountType === "percentage"
                            ? `${promo.discountValue}% OFF`
                            : `LKR ${promo.discountValue} OFF`}
                        </span>{" "}
                        on all orders
                        {minSpend > 0 ? ` over LKR ${minSpend.toLocaleString()}` : ""}!
                      </p>
                    </div>
                  </div>

                  {/* CLICKABLE COPY BUTTON */}
                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-center flex-shrink-0 active:scale-95 cursor-pointer flex flex-col items-center justify-center min-w-[140px]"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-100 flex items-center gap-1">
                      {isCopied ? (
                        <>
                          <FaCheck size={10} className="text-green-300" /> Copied!
                        </>
                      ) : (
                        "Click to Copy Code"
                      )}
                    </p>
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {promo.code}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Category Navigation Strip */}
        {!isLoading && products.length > 0 && (
          <div className="w-full flex items-center gap-6 overflow-x-auto pb-6 mb-12 scrollbar-none snap-x">
            {categoriesList.map((cat, idx) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="flex flex-col items-center flex-shrink-0 gap-3 group focus:outline-none snap-start"
                >
                  <div
                    className={`w-20 h-20 rounded-full p-1 transition-all duration-300 ${
                      isActive
                        ? "bg-slate-900 scale-105 shadow-md shadow-slate-200"
                        : "bg-white border border-slate-200 group-hover:border-rose-400"
                    }`}
                  >
                    {cat.name === "All" ? (
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center font-black text-[11px] uppercase tracking-wider ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        All Items
                      </div>
                    ) : (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                      isActive
                        ? "text-slate-900"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

               {/* Dynamic Loading Handler */}
        {isLoading ? (
          <div className="flex justify-center py-40">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-slate-100 w-full">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                  No products found
                </p>

                {searchTerm.trim() && (
                  <p className="mt-3 text-slate-400 text-sm">
                    Try searching by product name or alternative name.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}