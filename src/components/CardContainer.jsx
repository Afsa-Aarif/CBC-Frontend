// components/CardContainer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Inbox, ExternalLink } from 'lucide-react';
import { SkeletonCard } from './SkeletonCard';

export const CardContainer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Toggle comments below to test error or empty states:
      // throw new Error("Failed to load content.");
      // setData([]);
      
      setData({
        title: "Next-Gen Analytics Platform",
        description: "Monitor real-time data flow and optimize your performance seamlessly.",
        tag: "Active",
        link: "#"
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
      <AnimatePresence mode="wait">
        {/* 1. Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SkeletonCard />
          </motion.div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-red-950/10 p-6 text-center backdrop-blur-md"
          >
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">Unable to load data</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && (!data || data.length === 0) && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center backdrop-blur-md"
          >
            <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">No items found</h3>
            <p className="text-sm text-slate-400 mb-4">There is no content available right now.</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </motion.div>
        )}

        {/* 4. Loaded Data State */}
        {!loading && !error && data && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md hover:border-slate-700 transition-all"
          >
            <div className="relative rounded-xl overflow-hidden bg-slate-800 h-48 mb-4">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                alt="Card visual"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-md">
                {data.tag}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-slate-100 mb-2">{data.title}</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{data.description}</p>

            <div className="flex items-center justify-between">
              <button 
                onClick={fetchData}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Reload Card"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <a
                href={data.link}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors shadow-sm"
              >
                View Details <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};