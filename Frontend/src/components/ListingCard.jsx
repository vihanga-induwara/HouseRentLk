import { MapPin, Bed, Bath, Layout, Heart, Share2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Helper: check if listing was created within last 3 days
const isNewListing = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return created >= threeDaysAgo;
};

// Helper: check if listing was recently viewed (within last 3 days)
const isRecentlyViewed = (listingId) => {
    try {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const entry = viewed.find(v => v.id === listingId);
        if (!entry) return false;
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(entry.viewedAt) >= threeDaysAgo;
    } catch {
        return false;
    }
};

const ListingCard = ({ listing }) => {
    const { _id, title, price, location, beds, baths, size, images, createdAt, owner } = listing;
    const { isFavorite, toggleFavorite, user } = useAuth();

    const displayImage = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/300';
    const isNew = isNewListing(createdAt);
    const wasViewed = isRecentlyViewed(_id);
    const isFav = isFavorite(_id);

    const handleShare = async (e) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        const url = `${window.location.origin}/listings/${_id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            // User cancelled share or clipboard failed
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            } catch {
                toast.error('Failed to copy link');
            }
        }
    };

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }
        await toggleFavorite(_id);
    };

    return (
        <Link to={`/listings/${_id}`} className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={displayImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-900 font-bold text-sm shadow-sm">
                        LKR {price?.toLocaleString() || 'N/A'}<span className="text-xs text-slate-500 font-normal">/mo</span>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isNew && (
                            <div className="bg-primary-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                                New
                            </div>
                        )}
                        {wasViewed && (
                            <div className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                                Recently Viewed
                            </div>
                        )}
                        {owner?.isVerified && (
                            <div className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm shadow-sm flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (bottom-right of image) */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={handleShare}
                            className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                            title="Share"
                        >
                            <Share2 className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                            onClick={handleFavorite}
                            className={`backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 ${isFav
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-white/95 hover:bg-white'
                                }`}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart className={`h-4 w-4 ${isFav ? 'text-white fill-white' : 'text-slate-600'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">{title}</h3>

                    <div className="flex items-center text-slate-500 text-sm mb-6">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-primary-500" />
                        <span className="truncate">{location?.town || location?.address || 'Location generic'}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{beds}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{baths}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Layout className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{size}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Sqft</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
