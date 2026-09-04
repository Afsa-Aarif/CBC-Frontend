import { useState } from "react";

export default function imageSlider({ images = [] }) {
    const [activeImage, setActiveImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full max-w-[450px] aspect-square bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 text-sm font-medium border border-slate-200">
                No images available
            </div>
        );
    }

    return (
        <div className="w-full max-w-[450px] flex flex-col gap-4">
            {/* Main Active Image Display */}
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
                <img
                    src={images[activeImage]}
                    alt="Product View"
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
                <div className="w-full flex items-center justify-center gap-3 overflow-x-auto py-2 scrollbar-none">
                    {images.map((img, index) => {
                        const isSelected = activeImage === index;
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveImage(index)}
                                className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer focus:outline-none ${
                                    isSelected
                                        ? "border-accent ring-2 ring-accent/30 scale-105 shadow-md"
                                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                                }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}