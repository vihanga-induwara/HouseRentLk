import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ListingLightbox = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);
    const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
    const next = () => setCurrent(i => (i + 1) % images.length);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [images.length, onClose]);

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10"
                aria-label="Close lightbox"
            >
                <X className="h-8 w-8" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
                aria-label="Previous image"
            >
                <ChevronLeft className="h-8 w-8" />
            </button>
            <img
                src={images[current]}
                alt={`Photo ${current + 1}`}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            />
            <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
                aria-label="Next image"
            >
                <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-bold">
                {current + 1} / {images.length}
            </div>
        </div>
    );
};

export default ListingLightbox;
