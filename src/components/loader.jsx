export default function Loader() {
  return (
    <div
      className="flex min-h-[400px] w-full flex-col items-center justify-center py-20"
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex h-[120px] w-[120px] items-center justify-center">
        {/* Soft pulse ring */}
        <div className="absolute h-full w-full rounded-full border border-pink-500/20 animate-ping" />

        {/* Spinner */}
        <div className="h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-pink-500 shadow-sm" />

        {/* Center dot */}
        <div className="absolute h-2.5 w-2.5 rounded-full bg-[#001529]" />
      </div>

      <p className="mt-6 animate-pulse text-[10px] font-bold uppercase tracking-[0.35em] text-[#001529]/40">
        Initializing Crystal Beauty
      </p>

      <span className="sr-only">Loading Crystal Beauty...</span>
    </div>
  );
}
