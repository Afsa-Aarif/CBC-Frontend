// components/SkeletonCard.jsx
import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur-md">
      <div className="relative overflow-hidden rounded-xl bg-slate-800 h-48 w-full animate-pulse mb-4">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-700/30 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-slate-800 rounded-md w-3/4 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded-md w-full animate-pulse" />
        <div className="h-4 bg-slate-800 rounded-md w-2/3 animate-pulse" />
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="h-5 bg-slate-800 rounded-md w-1/4 animate-pulse" />
        <div className="h-9 bg-slate-800 rounded-lg w-28 animate-pulse" />
      </div>
    </div>
  );
};