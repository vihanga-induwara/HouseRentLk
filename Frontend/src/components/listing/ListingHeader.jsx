import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Flag } from 'lucide-react';

const ListingHeader = ({
    title,
    isFav,
    handleShare,
    handleFavorite,
    handleReport
}) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div>
                <Link to="/browse" className="inline-flex items-center text-slate-400 hover:text-primary-600 transition-all font-black uppercase tracking-widest text-[10px] mb-2 group">
                    <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Listings
                </Link>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleShare}
                    aria-label="Share listing"
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 transition-all text-xs font-black uppercase tracking-widest active:scale-95 bg-white/50 dark:bg-slate-800/50"
                >
                    <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                    onClick={handleFavorite}
                    aria-label={isFav ? 'Remove from saved' : 'Save listing'}
                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest active:scale-95 ${isFav
                        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-500 shadow-xl shadow-red-500/10'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-white dark:hover:bg-slate-800 bg-white/50 dark:bg-slate-800/50'
                        }`}
                >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
                </button>
                <button
                    onClick={handleReport}
                    aria-label="Report this listing"
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:border-red-200 transition-all text-xs font-black uppercase tracking-widest bg-white/50 dark:bg-slate-800/50"
                >
                    <Flag className="h-4 w-4" /> Report
                </button>
            </div>
        </div>
    );
};

export default ListingHeader;
