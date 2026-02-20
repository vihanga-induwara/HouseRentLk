import React from 'react';
import { Zap, Layout, TrendingDown, Shield } from 'lucide-react';

const ListingGallery = ({
    images,
    activeImage,
    setActiveImage,
    setLightboxOpen,
    isUrgent,
    marketInsight,
    virtualTourUrl
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-12">
            <div
                className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 h-[300px] md:h-[500px] lg:h-[650px] group cursor-pointer"
                onClick={() => setLightboxOpen(true)}
                role="button"
                aria-label="Open full-screen gallery"
            >
                <img
                    src={images[activeImage]}
                    alt="Active View"
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all text-white font-black text-sm uppercase tracking-widest bg-black/50 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        View Full Screen
                    </span>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                    {isUrgent && (
                        <div className="bg-red-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                            <Zap className="h-4 w-4 fill-current" /> Urgent Listing
                        </div>
                    )}
                    {marketInsight && marketInsight.difference <= -5 && (
                        <div className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" /> Exceptional Value
                        </div>
                    )}
                </div>

                {virtualTourUrl && (
                    <a
                        href={virtualTourUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-xl text-slate-900 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:bg-primary-600 hover:text-white transition-all"
                    >
                        <Layout className="h-5 w-5" /> 360° Virtual Tour
                    </a>
                )}

                <div className="absolute bottom-8 right-8 bg-black/50 text-white px-3 py-1.5 rounded-xl text-xs font-black" onClick={(e) => e.stopPropagation()}>
                    {activeImage + 1} / {images.length}
                </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4 h-[300px] md:h-[500px] lg:h-[650px]">
                {images.slice(0, 6).map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => { setActiveImage(idx); setLightboxOpen(true); }}
                        className={`relative rounded-[1.5rem] overflow-hidden cursor-pointer transition-all duration-300 ring-4 ${activeImage === idx ? 'ring-primary-500 scale-[0.98]' : 'ring-transparent hover:ring-slate-200 dark:hover:ring-slate-600'}`}
                        role="button"
                        aria-label={`View image ${idx + 1}`}
                    >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        {idx === 5 && images.length > 6 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-black text-xl italic">+{images.length - 6}</span>
                            </div>
                        )}
                    </div>
                ))}
                {images.length < 6 && [...Array(6 - images.length)].map((_, i) => (
                    <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-slate-200 dark:text-slate-600" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListingGallery;
