import { MapPin, Bed, Bath, Layout, Heart, Share2, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';

const ListingCard = ({ listing }) => {
    const {
        _id, title, price, location, beds, baths, size, images,
        isUrgent, isNewListing, owner, isGoodDeal
    } = listing;
    const { isFavorite, toggleFavorite, user } = useAuth();

    const displayImage = images && images.length > 0 ? images[0] : NO_IMAGE_PLACEHOLDER;
    const isFav = isFavorite(_id);

    const handleShare = async (e) => {
        e.preventDefault();
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
        <Link to={`/listings/${_id}`} className="group h-full">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-600/10 transition-all duration-500 border border-slate-100 h-full flex flex-col active:scale-[0.98]">
                <div className="relative h-48 md:h-64 overflow-hidden">
                    <img
                        src={displayImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-primary-700 font-bold text-sm md:text-base shadow-sm border border-white/20">
                        {formatCurrency(price)}<span className="text-[10px] text-slate-500 font-bold uppercase ml-1">/mo</span>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isUrgent && (
                            <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5 min-w-fit">
                                <Zap className="h-3 w-3 fill-current" /> Urgent
                            </div>
                        )}
                        {isNewListing && (
                            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg min-w-fit">
                                New listing
                            </div>
                        )}
                        {isGoodDeal && (
                            <div className="bg-primary-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5 min-w-fit">
                                <ShieldCheck className="h-3 w-3" /> Good Deal
                            </div>
                        )}
                        {owner?.isVerified && (
                            <div className="bg-white/90 text-primary-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg flex items-center gap-1.5 border border-primary-100 min-w-fit">
                                <ShieldCheck className="h-3 w-3" /> Verified Owner
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <button
                            onClick={handleShare}
                            className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 border border-slate-100"
                            title="Share"
                        >
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </button>
                        <button
                            onClick={handleFavorite}
                            className={`backdrop-blur-md p-3 rounded-2xl shadow-xl hover:scale-110 transition-all duration-200 border ${isFav
                                ? 'bg-red-500 border-red-500 hover:bg-red-600'
                                : 'bg-white/95 border-slate-100 hover:bg-white'
                                }`}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart className={`h-5 w-5 ${isFav ? 'text-white fill-current' : 'text-slate-600'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 md:mb-3">
                        <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 mr-2 text-primary-500" />
                        <span className="truncate">{location?.town || 'Location Generic'}</span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 line-clamp-1 group-hover:text-primary-600 transition-colors leading-tight">{title}</h3>

                    <div className="flex items-center justify-between mt-auto pt-4 md:pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <div className="p-1 md:p-1.5 bg-slate-50 rounded-lg">
                                    <Bed className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-500" />
                                </div>
                                <span className="text-xs md:text-sm font-bold text-slate-700">{beds}</span>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <div className="p-1 md:p-1.5 bg-slate-50 rounded-lg">
                                    <Bath className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-500" />
                                </div>
                                <span className="text-xs md:text-sm font-bold text-slate-700">{baths}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-primary-50/50 rounded-xl border border-primary-50">
                            <Layout className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-500" />
                            <span className="text-xs md:text-sm font-bold text-primary-700">{size}</span>
                            <span className="text-[9px] md:text-[10px] text-primary-400 font-bold uppercase">Sqft</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
