import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import {
    MapPin, Bed, Bath, Layout, Share2, Heart, Shield, Check,
    Phone, Mail, ArrowLeft, Calendar, MessageSquare, Send,
    ShieldCheck, Star, Info, TrendingDown, TrendingUp, Minus
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ListingDetail = () => {
    const { id } = useParams();
    const { isFavorite, toggleFavorite, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Market Insight state
    const [marketInsight, setMarketInsight] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [listingRes, reviewsRes, insightRes] = await Promise.all([
                    API.get(`/listings/${id}`),
                    API.get(`/reviews/${id}`),
                    API.get(`/listings/${id}/market-insights`)
                ]);

                setListing(listingRes.data);
                setReviews(reviewsRes.data);
                setMarketInsight(insightRes.data);

                // Track recently viewed
                try {
                    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const filtered = viewed.filter(v => v.id !== id);
                    filtered.unshift({ id, viewedAt: new Date().toISOString() });
                    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 50)));
                } catch (e) { }
            } catch (err) {
                setError("Failed to load listing details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    const handleShare = async () => {
        const url = `${window.location.origin}/listings/${id}`;
        try {
            // Track share on backend
            await API.post(`/tracking/share/${id}`);

            if (navigator.share) {
                await navigator.share({ title: listing.title, url });
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

    const handleFavorite = async () => {
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }
        await toggleFavorite(id);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to leave a review');
            return;
        }
        if (!newReview.comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            const { data } = await API.post('/reviews', {
                listingId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setReviews([data, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review added successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-slate-500 font-medium">Loading details...</div>;
    if (error || !listing) return <div className="text-center py-20 text-red-500 font-bold">{error || "Listing not found"}</div>;

    const {
        title, price, location, description,
        beds, baths, size, type,
        images, amenities, owner,
        contactDetails, aiDescription = {},
        availableVisits = [], virtualTourUrl
    } = listing;

    const displayAddress = location ? `${location.address}, ${location.town}` : 'Address Unavailable';
    const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x400'];
    const isFav = isFavorite(id);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex justify-between items-center mb-6">
                <Link to="/browse" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Listings
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                        <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button
                        onClick={handleFavorite}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium ${isFav
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50'
                            }`}
                    >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[500px] mb-10">
                <div className="h-full relative group">
                    <img src={displayImages[0]} alt="Main View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="grid grid-cols-2 gap-4 h-full">
                    {displayImages.slice(1, 4).map((img, idx) => (
                        <div key={idx} className="h-full relative overflow-hidden group">
                            <img src={img} alt="Property" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                    ))}
                    {displayImages.length > 4 && (
                        <div className="h-full relative overflow-hidden group">
                            <img src={displayImages[4]} className="w-full h-full object-cover blur-[2px]" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                <span className="text-white font-bold text-lg">+ {displayImages.length - 4} photos</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{title}</h1>
                                <div className="flex items-center text-slate-500 font-medium">
                                    <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                                    {displayAddress}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary-600">LKR {price?.toLocaleString()}</div>
                                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Per Month</div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 py-8 border-y border-slate-100">
                            {[
                                { label: 'Bedrooms', value: beds, icon: Bed },
                                { label: 'Bathrooms', value: baths, icon: Bath },
                                { label: 'Square Ft', value: size, icon: Layout },
                                { label: 'Property Type', value: type, icon: Shield },
                            ].map((stat, i) => (
                                <div key={i} className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                    <stat.icon className="h-6 w-6 text-primary-500 mb-2" />
                                    <span className="block font-bold text-slate-900 text-lg">{stat.value}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Insight Section */}
                    {marketInsight && (
                        <div className="bg-primary-50/30 border border-primary-100 p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary-500" /> Market Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${marketInsight.status === 'good_deal' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {marketInsight.status === 'good_deal' ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-600 uppercase tracking-tighter">Value vs Area</div>
                                        <div className="font-bold text-slate-900">{marketInsight.difference < 0 ? `${Math.abs(marketInsight.percentDiff)}% Below Avg` : `${marketInsight.percentDiff}% Above Avg`}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Area Avg Rent</div>
                                    <div className="font-bold text-slate-900 text-xl">LKR {marketInsight.areaAverage.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Virtual Tour */}
                    {virtualTourUrl && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">360° Virtual Tour</h2>
                            <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-3xl overflow-hidden group shadow-lg">
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                                    <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-full font-bold text-slate-900 shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                                        Open 360° View
                                    </div>
                                </div>
                                <img src={displayImages[0]} className="w-full h-full object-cover blur-[1px]" />
                            </a>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">About this home</h2>
                        {aiDescription?.description && (
                            <div className="mb-6 bg-primary-50/50 p-6 rounded-2xl border border-primary-100 relative italic text-slate-700 leading-relaxed group">
                                <div className="absolute -top-3 left-6 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">AI Summary</div>
                                {aiDescription.description}
                            </div>
                        )}
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {description}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                            {(amenities ? Object.entries(amenities)
                                .filter(([key, value]) => value === true || (typeof value === 'string' && value !== 'None' && value !== ''))
                                .map(([key, value]) => {
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return typeof value === 'string' ? `${formattedKey}: ${value}` : formattedKey;
                                }) : []
                            ).map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="h-6 w-6 rounded-full bg-secondary-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3.5 w-3.5 text-secondary-600" />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="pt-10 border-t border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Community Reviews ({reviews.length})</h2>

                        {/* Review Form */}
                        {user && (
                            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-10">
                                <h3 className="font-bold text-slate-900 mb-4">Leave a Review</h3>
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setNewReview({ ...newReview, rating: s })}>
                                            <Star className={`h-6 w-6 ${newReview.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 text-sm h-24 mb-3 p-3"
                                    placeholder="Share your experience with this property and owner..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                />
                                <Button type="submit" isLoading={submittingReview} size="sm">Post Review</Button>
                            </form>
                        )}

                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-slate-400 italic text-center py-4">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map(r => (
                                    <div key={r._id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {r.reviewer?.name?.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm">{r.reviewer?.name}</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                                        <div className="mt-2 text-[10px] text-slate-400 font-medium">{new Date(r.createdAt).toLocaleDateString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl border-2 border-white shadow-md">
                                {owner?.name?.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="font-bold text-slate-900 text-lg">{owner?.name}</p>
                                    {owner?.isVerified && <ShieldCheck className="h-5 w-5 text-primary-600" />}
                                </div>
                                <div className="flex items-center text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-widest mt-1 w-fit">
                                    {owner?.isVerified ? 'Verified Owner' : 'Verified Member'}
                                </div>
                            </div>
                        </div>

                        {/* Visit Availability */}
                        {availableVisits.length > 0 && (
                            <div className="mb-6 space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visit Schedule</h4>
                                {availableVisits.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="font-bold text-slate-700">{v.day}</span>
                                        <span className="text-slate-500">{v.times}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Inquiry Form */}
                        <div className="space-y-4">
                            {!inquirySent ? (
                                <>
                                    <textarea
                                        className="w-full rounded-2xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-3 border h-32 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm"
                                        placeholder={`Hi ${owner?.name?.split(' ')[0]}, I'm interested...`}
                                        value={inquiryMsg}
                                        onChange={(e) => setInquiryMsg(e.target.value)}
                                    />
                                    <Button
                                        className="w-full py-4 text-base font-bold shadow-lg shadow-primary-500/30 rounded-2xl"
                                        isLoading={sendingInquiry}
                                        onClick={async () => {
                                            if (!user) { toast.error('Please login'); return; }
                                            if (!inquiryMsg) { toast.error('Msg required'); return; }
                                            setSendingInquiry(true);
                                            try {
                                                await API.post('/inquiries', { listingId: id, message: inquiryMsg });
                                                setInquirySent(true);
                                                toast.success('Sent!');
                                            } catch (err) { toast.error('Failed'); } finally { setSendingInquiry(false); }
                                        }}
                                    >
                                        Send Message
                                    </Button>
                                </>
                            ) : (
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center text-sm font-bold border border-green-100">
                                    Inquiry Sent Successfully!
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center">
                            {contactDetails?.phone2 && (
                                <div className="text-xs text-slate-400 font-medium">Alternative Contact</div>
                            )}
                            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                <Phone className="h-4 w-4 text-primary-500" /> {owner?.phone}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
