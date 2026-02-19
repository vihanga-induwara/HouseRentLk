import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import {
    MapPin, Bed, Bath, Layout, Share2, Heart, Shield, Check,
    Phone, ArrowLeft, MessageSquare,
    ShieldCheck, Star, Info, TrendingDown, TrendingUp,
    Zap, Eye, CheckCircle, Sparkles, X, ChevronLeft, ChevronRight,
    Flag, Send, Calendar
} from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

// ─── Lightbox ──────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

// ─── Helper: normalize Sri Lanka phone number to international format ──────
const normalizePhone = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('94')) return digits;
    if (digits.startsWith('0')) return '94' + digits.slice(1);
    return digits;
};

// ─── Investment rating computed from actual data ───────────────────────────
const getInvestmentRating = (insight) => {
    if (!insight) return null;
    const diff = insight.difference;
    if (diff <= -15) return { grade: 'A+', label: 'Exceptional Value', color: 'text-emerald-300' };
    if (diff <= -5) return { grade: 'A', label: 'Great Value', color: 'text-green-300' };
    if (diff <= 5) return { grade: 'B+', label: 'Fair Market Rate', color: 'text-blue-300' };
    if (diff <= 15) return { grade: 'B', label: 'Slightly Above Market', color: 'text-amber-300' };
    return { grade: 'C', label: 'Above Market Price', color: 'text-red-300' };
};

const ListingDetail = () => {
    const { id } = useParams();
    const { isFavorite, toggleFavorite, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Market & Similar
    const [marketInsight, setMarketInsight] = useState(null);
    const [similarListings, setSimilarListings] = useState([]);

    // Commute Calculator State
    const [commuteAddr, setCommuteAddr] = useState('');
    const [commuteResult, setCommuteResult] = useState(null);
    const [calculatingCommute, setCalculatingCommute] = useState(false);

    // Report modal
    const [showReport, setShowReport] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    const calculateCommute = useCallback(async () => {
        if (!commuteAddr) return;
        if (!listing?.location?.coordinates?.coordinates?.length) {
            toast.error('This listing has no precise location set — commute cannot be calculated.');
            return;
        }
        setCalculatingCommute(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(commuteAddr)}, Sri Lanka`);
            const data = await res.json();

            if (data && data.length > 0) {
                const destLat = parseFloat(data[0].lat);
                const destLon = parseFloat(data[0].lon);

                const propLat = listing.location.coordinates.coordinates[1];
                const propLon = listing.location.coordinates.coordinates[0];

                const R = 6371;
                const dLat = (destLat - propLat) * Math.PI / 180;
                const dLon = (destLon - propLon) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(propLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;

                setCommuteResult({
                    distance: d.toFixed(1),
                    drive: Math.round((d / 30) * 60),
                    bus: Math.round((d / 15) * 60)
                });
            } else {
                toast.error('Location not found. Try a landmark or area name.');
            }
        } catch {
            toast.error('Failed to calculate commute');
        } finally {
            setCalculatingCommute(false);
        }
    }, [commuteAddr, listing]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            // Critical: fetch listing first — fail hard if this fails
            let listingData, reviewsData;
            try {
                const [listingRes, reviewsRes] = await Promise.all([
                    API.get(`/listings/${id}`),
                    API.get(`/reviews/${id}`),
                ]);
                listingData = listingRes.data;
                reviewsData = reviewsRes.data;
            } catch (err) {
                setError('Failed to load listing details. It may have been removed.');
                setLoading(false);
                console.error(err);
                return;
            }

            setListing(listingData);
            setReviews(reviewsData);

            // Non-critical: market insights and similar — fail gracefully
            const [insightRes, similarRes] = await Promise.allSettled([
                API.get(`/listings/${id}/market-insights`),
                API.get(`/listings/${id}/similar`),
            ]);
            if (insightRes.status === 'fulfilled') setMarketInsight(insightRes.value.data);
            if (similarRes.status === 'fulfilled') setSimilarListings(similarRes.value.data);

            // Track recently viewed
            try {
                const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const filtered = viewed.filter(v => v.id !== id);
                filtered.unshift({
                    id,
                    title: listingData.title,
                    image: listingData.images?.[0],
                    price: listingData.price,
                    viewedAt: new Date().toISOString()
                });
                localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
            } catch { /* silent */ }

            setLoading(false);
        };

        fetchAllData();
    }, [id]);

    const handleShare = async () => {
        const url = `${window.location.origin}/listings/${id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: listing.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            }
        } catch {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            } catch {
                toast.error('Failed to copy link');
            }
        }
    };

    const handleWhatsApp = () => {
        const rawPhone = listing.contactDetails?.whatsapp || listing.owner?.phone;
        const phone = normalizePhone(rawPhone);
        if (!phone) { toast.error('No WhatsApp number available'); return; }
        const msg = encodeURIComponent(listing.contactDetails?.whatsappMsg || `Hi, I'm interested in your property "${listing.title}" on HouseRentLk.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    const handleFavorite = async () => {
        if (!user) { toast.error('Please login to save favorites'); return; }
        await toggleFavorite(id);
    };

    const handleInquiry = async () => {
        if (!user) { toast.error('Please login'); return; }
        const message = inquiryMsg.trim() || "Hi, I'm interested in your property.";
        setSendingInquiry(true);
        try {
            await API.post('/inquiries', { listingId: id, message });
            setInquirySent(true);
            toast.success('Inquiry Sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send inquiry');
        } finally {
            setSendingInquiry(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login to leave a review'); return; }
        if (!newReview.comment.trim()) { toast.error('Please write a comment'); return; }
        setSubmittingReview(true);
        try {
            const { data } = await API.post('/reviews', {
                listingId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setReviews([data, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleReport = async () => {
        if (!user) { toast.error('Please login to report'); return; }
        if (!reportReason.trim()) { toast.error('Please provide a reason'); return; }
        setSubmittingReport(true);
        try {
            await API.post('/listings/report', { listingId: id, reason: reportReason });
            toast.success('Listing reported. Our team will review it.');
            setShowReport(false);
            setReportReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report');
        } finally {
            setSubmittingReport(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-8">
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-1/3"></div>
                <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>)}
                </div>
            </div>
        </div>
    );

    if (error || !listing) return (
        <div className="text-center py-20">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-red-500 font-bold text-lg">{error || 'Listing not found'}</p>
            <Link to="/browse" className="mt-4 inline-block text-primary-600 font-black underline">← Back to Browse</Link>
        </div>
    );

    const {
        title, price, location, description,
        beds, baths, size, type,
        images, amenities, owner,
        contactDetails, aiDescription: aiData,
        virtualTourUrl, isUrgent, views,
        availableVisits, tenantType, houseRules, minRentalPeriod,
        agreementRequired, availableFrom, furnished
    } = listing;

    const aiDescription = aiData || {};
    const displayAddress = location ? `${location.address}, ${location.town}` : 'Address Unavailable';
    const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x400'];
    const isFav = isFavorite(id);
    const investmentRating = getInvestmentRating(marketInsight);

    // Average rating from actual reviews
    const avgRating = reviews.length > 0
        ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 bg-slate-50/30 dark:bg-slate-950 min-h-screen">
            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox images={displayImages} startIndex={activeImage} onClose={() => setLightboxOpen(false)} />
            )}

            {/* Report Modal */}
            {showReport && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8">
                        <h3 className="font-black text-slate-900 dark:text-white text-xl mb-2">Report Listing</h3>
                        <p className="text-slate-500 text-sm mb-6">Help us keep HouseRentLk safe. Describe why this listing is problematic.</p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="e.g. Fake listing, wrong price, offensive content..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm resize-none focus:border-red-400 outline-none"
                        />
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black">Cancel</button>
                            <button onClick={handleReport} disabled={submittingReport} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black disabled:opacity-60">
                                {submittingReport ? 'Sending...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb & Navigation */}
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
                        onClick={() => setShowReport(true)}
                        aria-label="Report this listing"
                        className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:border-red-200 transition-all text-xs font-black uppercase tracking-widest bg-white/50 dark:bg-slate-800/50"
                    >
                        <Flag className="h-4 w-4" /> Report
                    </button>
                </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                <div
                    className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 h-[500px] lg:h-[650px] group cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                    role="button"
                    aria-label="Open full-screen gallery"
                >
                    <img
                        src={displayImages[activeImage]}
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
                        {activeImage + 1} / {displayImages.length}
                    </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-4 h-[500px] lg:h-[650px]">
                    {displayImages.slice(0, 6).map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => { setActiveImage(idx); setLightboxOpen(true); }}
                            className={`relative rounded-[1.5rem] overflow-hidden cursor-pointer transition-all duration-300 ring-4 ${activeImage === idx ? 'ring-primary-500 scale-[0.98]' : 'ring-transparent hover:ring-slate-200 dark:hover:ring-slate-600'}`}
                            role="button"
                            aria-label={`View image ${idx + 1}`}
                        >
                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            {idx === 5 && displayImages.length > 6 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-black text-xl italic">+{displayImages.length - 6}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {displayImages.length < 6 && [...Array(6 - displayImages.length)].map((_, i) => (
                        <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-slate-200 dark:text-slate-600" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-16">
                    <div>
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-primary-100 dark:border-primary-800">
                                {type}
                            </span>
                            {furnished && (
                                <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl">
                                    {furnished}
                                </span>
                            )}
                            {tenantType && tenantType !== 'Any' && (
                                <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-amber-100 dark:border-amber-800">
                                    {tenantType} preferred
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Eye className="h-4 w-4" /> {views || 0} Views
                            </span>
                        </div>
                        <div className="flex items-start text-slate-500 dark:text-slate-400 font-bold text-2xl mb-10">
                            <MapPin className="h-7 w-7 mr-3 text-primary-500 shrink-0 mt-0.5" />
                            {displayAddress}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-slate-100 dark:border-slate-800">
                            {[
                                { label: 'Bedrooms', value: beds, icon: Bed },
                                { label: 'Bathrooms', value: baths, icon: Bath },
                                { label: 'Square Ft', value: size, icon: Layout },
                                { label: 'Property Type', value: type, icon: Shield },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all">
                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl mb-4">
                                        <stat.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="block font-black text-slate-900 dark:text-white text-3xl italic tracking-tighter mb-1">{stat.value}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Additional info row */}
                        {(availableFrom || minRentalPeriod || agreementRequired) && (
                            <div className="flex flex-wrap gap-4 mt-6">
                                {availableFrom && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <Calendar className="h-4 w-4 text-primary-500" />
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                            Available from {new Date(availableFrom).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                {minRentalPeriod > 1 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <CheckCircle className="h-4 w-4 text-primary-500" />
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                            Min {minRentalPeriod} month{minRentalPeriod > 1 ? 's' : ''} rental
                                        </span>
                                    </div>
                                )}
                                {agreementRequired && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                        <Shield className="h-4 w-4 text-amber-600" />
                                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Agreement Required</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Market Intelligence */}
                    {marketInsight && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-8 italic tracking-tight flex items-center gap-3">
                                    <TrendingDown className="h-6 w-6 text-primary-400" /> Market Intelligence
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Listing Price</span>
                                            <span className="text-2xl font-black italic">{formatCurrency(listing.price)}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Area Average</span>
                                            <span className="text-2xl font-black italic">{formatCurrency(marketInsight.areaAverage)}</span>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                            <p className="text-sm font-bold text-slate-300 italic">
                                                {marketInsight.difference <= -5
                                                    ? `This property is priced ${Math.abs(marketInsight.difference)}% lower than similar listings in ${location?.town}. High demand expected.`
                                                    : marketInsight.difference > 10
                                                        ? `This property is ${Math.abs(marketInsight.difference)}% above average for ${location?.town}.`
                                                        : 'This property is priced at a competitive market rate for the area.'}
                                            </p>
                                        </div>
                                    </div>
                                    {investmentRating && (
                                        <div className="bg-primary-600/20 rounded-[2rem] p-8 border border-primary-500/30 flex flex-col justify-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-4">Investment Rating</h4>
                                            <div className={`text-5xl font-black italic mb-2 ${investmentRating.color}`}>{investmentRating.grade}</div>
                                            <p className="text-xs font-bold text-primary-200 uppercase tracking-widest">{investmentRating.label}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Commute & Neighborhood */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-black dark:text-white mb-8 italic tracking-tight flex items-center gap-3">
                                <MapPin className="h-6 w-6 text-primary-500" /> Commute Calculator
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Work / Study Destination</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. Fort, Colombo..."
                                            value={commuteAddr}
                                            onChange={(e) => setCommuteAddr(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && calculateCommute()}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        />
                                        <button
                                            onClick={calculateCommute}
                                            disabled={calculatingCommute || !commuteAddr}
                                            aria-label="Calculate commute"
                                            className="bg-primary-600 text-white px-4 rounded-2xl disabled:opacity-50 hover:bg-primary-700 transition-colors"
                                        >
                                            <TrendingUp className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {commuteResult ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Min Drive', value: commuteResult.drive },
                                            { label: 'Min Bus', value: commuteResult.bus },
                                            { label: 'Km Away', value: commuteResult.distance },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                                                <div className="text-primary-600 font-black text-lg mb-1">{value}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 text-xs italic py-4">
                                        {listing?.location?.coordinates?.coordinates?.length
                                            ? 'Enter a destination to calculate commute time.'
                                            : 'Commute unavailable — listing has no precise location.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] p-10 border border-primary-100 dark:border-primary-800/40 relative overflow-hidden group">
                            <Sparkles className="absolute top-10 right-10 h-12 w-12 text-primary-200 rotate-12 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black mb-8 italic tracking-tight text-primary-900 dark:text-primary-100">Neighborhood Lens</h3>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-primary-700 dark:text-primary-300 italic leading-relaxed">
                                    {aiDescription?.townVibe || (location ? `${location.town} is a well-connected residential area with good access to amenities and transport.` : 'This property is in a residential area.')}
                                </p>
                                {availableVisits && availableVisits.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">Available for Visits</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableVisits.map((v, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/60 dark:bg-primary-800/40 rounded-xl text-xs font-black text-primary-800 dark:text-primary-200 border border-white/40">
                                                    {v.day} {v.times}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Insights */}
                    {aiDescription?.description && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic tracking-tight">
                                <CheckCircle className="h-6 w-6 text-primary-500" /> Neighborhood <span className="text-primary-600">DNA</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 text-primary-50 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                        <Info className="h-48 w-48" />
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold italic text-lg relative z-10">
                                        &ldquo;{aiDescription.description}&rdquo;
                                    </p>
                                </div>
                                <div className="md:col-span-4 bg-primary-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                                    <div className="text-[10px] font-black text-primary-200 uppercase tracking-[0.2em] mb-4">The Local Vibe</div>
                                    <p className="font-black italic text-xl leading-snug">
                                        {aiDescription.townVibe || 'Prime Residential Hub.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description & Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Home <span className="text-primary-600">Description</span></h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg whitespace-pre-line">{description}</p>
                            {houseRules && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                                    <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">House Rules</h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{houseRules}</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Premium <span className="text-primary-600">Amenities</span></h2>
                            <div className="grid grid-cols-1 gap-4">
                                {(amenities ? Object.entries(amenities)
                                    .filter(([, value]) => value === true || (typeof value === 'string' && value !== 'None' && value !== ''))
                                    .map(([key, value]) => {
                                        const formatted = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return typeof value === 'string' ? `${formatted}: ${value}` : formatted;
                                    }) : []
                                ).map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:translate-x-2">
                                        <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="pt-16 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">
                                Community <span className="text-primary-600">Voice</span> ({reviews.length})
                            </h2>
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < avgRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-slate-600 dark:text-slate-300">{avgRating.toFixed(1)} / 5</span>
                                </div>
                            )}
                        </div>

                        {/* Write a Review */}
                        {user && (
                            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-10">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-widest">Leave a Review</h4>
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button
                                            key={i}
                                            type="button"
                                            aria-label={`Rate ${i} stars`}
                                            onClick={() => setNewReview(prev => ({ ...prev, rating: i }))}
                                        >
                                            <Star className={`h-6 w-6 cursor-pointer transition-colors ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600 hover:text-amber-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Share your experience..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-medium text-sm resize-none focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                                />
                                <Button type="submit" isLoading={submittingReview} className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3">
                                    Submit Review
                                </Button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.length === 0 ? (
                                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-400 italic font-black uppercase tracking-widest text-xs">Be the first to share your thoughts</p>
                                </div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r._id} className="p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/30 group hover:translate-y-[-4px] transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-sm font-black text-white italic">
                                                    {r.reviewer?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block font-black text-slate-900 dark:text-white text-lg italic tracking-tight">{r.reviewer?.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />)}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic">&ldquo;{r.comment}&rdquo;</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Similar Listings — full width below content */}
                    {similarListings.length > 0 && (
                        <div className="pt-16 border-t border-slate-100 dark:border-slate-800">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight mb-8">
                                Similar <span className="text-primary-600">Properties</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {similarListings.map(l => (
                                    <Link key={l._id} to={`/listings/${l._id}`} className="bg-white dark:bg-slate-800 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all block group">
                                        <img
                                            src={l.images?.[0] || 'https://via.placeholder.com/300x200'}
                                            className="w-full h-48 object-cover rounded-[1.5rem] mb-4 group-hover:scale-[1.02] transition-transform"
                                            alt={l.title}
                                            loading="lazy"
                                        />
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{l.title}</h3>
                                        <p className="text-primary-600 font-black">{formatCurrency(l.price)}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{l.location?.town}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Pricing & Contact Sticky */}
                <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl shadow-slate-200/80 dark:shadow-none border border-slate-100 dark:border-slate-700 p-12 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-500 to-blue-500"></div>

                        <div className="mb-8">
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Monthly Rent</div>
                            <div className="flex items-baseline gap-2 group">
                                <span className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">{formatCurrency(price)}</span>
                            </div>
                            {listing.negotiable && (
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1 block">Price Negotiable</span>
                            )}
                        </div>

                        {/* Owner Card */}
                        <div className="flex items-center gap-5 p-6 bg-slate-50/80 dark:bg-slate-700/50 rounded-[2.5rem] mb-8 group cursor-pointer border border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl transition-all">
                            <div className="relative">
                                <div className="h-16 w-16 bg-slate-900 dark:bg-slate-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl group-hover:scale-110 transition-transform">
                                    {owner?.name?.charAt(0)}
                                </div>
                                {owner?.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary-600 p-2 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 shadow-lg">
                                        <ShieldCheck className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white italic tracking-tight">{owner?.name}</p>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Property Owner</div>
                            </div>
                        </div>

                        {/* Inquiry */}
                        <div className="space-y-4">
                            {!inquirySent ? (
                                <>
                                    <textarea
                                        value={inquiryMsg}
                                        onChange={(e) => setInquiryMsg(e.target.value)}
                                        placeholder="Hi, I'm interested in this property. I'd like to..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-medium text-sm resize-none focus:border-primary-500 outline-none transition-colors"
                                    />
                                    <Button
                                        className="w-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 rounded-[1.5rem] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        onClick={handleInquiry}
                                        isLoading={sendingInquiry}
                                        disabled={sendingInquiry}
                                    >
                                        <Send className="h-4 w-4" /> Send Inquiry
                                    </Button>
                                    <button
                                        onClick={handleWhatsApp}
                                        className="w-full py-5 bg-green-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-2xl shadow-green-500/20 active:scale-95"
                                    >
                                        <MessageSquare className="h-5 w-5 fill-current" /> WhatsApp Chat
                                    </button>
                                </>
                            ) : (
                                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-8 rounded-[2rem] text-center text-xs font-black uppercase tracking-widest border border-green-100 dark:border-green-800 flex flex-col items-center gap-3">
                                    <CheckCircle className="h-8 w-8" /> Inquiry Sent!
                                </div>
                            )}

                            {owner?.phone && (
                                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Direct Call</span>
                                    <a
                                        href={`tel:${owner.phone}`}
                                        className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                    >
                                        <Phone className="h-3.5 w-3.5" /> {owner.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
