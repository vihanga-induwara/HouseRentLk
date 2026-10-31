import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import {
    Heart, Share2, MapPin, Calendar, Clock, Star, Info, Shield, CheckCircle, Tag,
    ChevronRight, ChevronLeft, Eye, Send, MessageCircle, AlertTriangle, ShieldAlert,
    Camera, Image as ImageIcon, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';

// Components
import ListingLightbox from '../components/listing/ListingLightbox';
import ListingHeader from '../components/listing/ListingHeader';
import ListingGallery from '../components/listing/ListingGallery';
import ListingStats from '../components/listing/ListingStats';
import ListingMarketIntelligence from '../components/listing/ListingMarketIntelligence';
import ListingMap from '../components/listing/ListingMap';
import ListingSafety from '../components/listing/ListingSafety';
import ListingDescription from '../components/listing/ListingDescription';
import ListingReviews from '../components/listing/ListingReviews';
import ListingSimilar from '../components/listing/ListingSimilar';
import ListingSidebar from '../components/listing/ListingSidebar';
import RentAffordabilityCalculator from '../components/rent-tools/RentAffordabilityCalculator';
import RentalDepositPlanner from '../components/rent-tools/RentalDepositPlanner';
import { formatTimeAgo, formatFullDate } from '../utils/format';

const ListingDetail = () => {
    const { id } = useParams();
    const { isFavorite, toggleFavorite, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Review states
    const [reviews, setReviews] = useState([]);

    // Market & Similar
    const [marketInsight, setMarketInsight] = useState(null);
    const [similarListings, setSimilarListings] = useState([]);

    // AI Features
    const [priceFairness, setPriceFairness] = useState(null);
    const [reviewSentiment, setReviewSentiment] = useState(null);
    const [areaSafety, setAreaSafety] = useState(null);

    // Report modal
    const [showReport, setShowReport] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportScreenshot, setReportScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [reportContactEmail, setReportContactEmail] = useState(user?.email || '');
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            let listingData;

            try {
                const res = await API.get(`/listings/${id}`);
                listingData = res.data;
                setListing(listingData);
            } catch {
                setError('Failed to load listing details. It may have been removed.');
                setLoading(false);
                return;
            }

            // Parallel fetch for non-critical
            Promise.allSettled([
                API.get(`/reviews/${id}`),
                API.get(`/listings/${id}/market-insights`),
                API.get(`/listings/${id}/similar`),
                API.get(`/ai/price-fairness/${id}`),
                API.get(`/ai/sentiment/${id}`),
                API.get(`/ai/safety-score/${id}`),
            ]).then(results => {
                const [reviews, insights, similar, fairness, sentiment, safety] = results;

                if (reviews.status === 'fulfilled' && Array.isArray(reviews.value.data)) setReviews(reviews.value.data);
                if (insights.status === 'fulfilled') setMarketInsight(insights.value.data);
                if (similar.status === 'fulfilled' && Array.isArray(similar.value.data)) setSimilarListings(similar.value.data);
                if (fairness.status === 'fulfilled') setPriceFairness(fairness.value.data);
                if (sentiment.status === 'fulfilled') setReviewSentiment(sentiment.value.data);
                if (safety.status === 'fulfilled') setAreaSafety(safety.value.data);
            });

            // Update history
            try {
                const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const filtered = viewed.filter(v => v.id !== id);
                filtered.unshift({
                    id,
                    title: listingData.title,
                    image: listingData.images?.[0],
                    price: listingData.price,
                    viewedAt: new Date().toISOString(),
                    createdAt: listingData.createdAt
                });
                localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
            } catch { /* silent */ }

            setLoading(false);
        };

        loadData();
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

    const handleFavorite = async () => {
        if (!user) { toast.error('Please login to save favorites'); return; }
        await toggleFavorite(id);
    };

    const handleReport = async () => {
        if (!user) { toast.error('Please login to report'); return; }
        if (!reportReason.trim()) { toast.error('Please select a reason'); return; }
        if (!reportDescription.trim()) { toast.error('Please provide a description'); return; }

        setSubmittingReport(true);
        try {
            let screenshotUrl = '';

            // 1. Upload screenshot if selected
            if (reportScreenshot) {
                const uploadData = new FormData();
                uploadData.append('images', reportScreenshot);
                const uploadRes = await API.post('/upload/multiple', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                screenshotUrl = uploadRes.data[0];
            }

            // 2. Submit report
            await API.post('/listings/report', {
                listingId: id,
                reason: reportReason,
                description: reportDescription,
                screenshot: screenshotUrl,
                contactEmail: reportContactEmail
            });

            toast.success('Listing reported. Our team will review it.');
            setShowReport(false);
            setReportReason('');
            setReportDescription('');
            setReportScreenshot(null);
            setScreenshotPreview(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report');
        } finally {
            setSubmittingReport(false);
        }
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            setReportScreenshot(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const handleReviewAdded = (newReview) => {
        setReviews([newReview, ...reviews]);
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
        images, amenities, aiDescription,
        virtualTourUrl, isUrgent, views,
        tenantType, houseRules, minRentalPeriod,
        agreementRequired, availableFrom, furnished, autoTags, createdAt
    } = listing;

    const displayAddress = location ? `${location.address}, ${location.town}` : 'Address Unavailable';
    const displayImages = images && images.length > 0 ? images : [NO_IMAGE_PLACEHOLDER];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-slate-50/30 dark:bg-slate-950 min-h-screen">
            {/* Lightbox */}
            {lightboxOpen && (
                <ListingLightbox images={displayImages} startIndex={activeImage} onClose={() => setLightboxOpen(false)} />
            )}

            {/* Report Modal */}
            {showReport && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 my-auto border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <ShieldAlert className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-xl">Report Listing</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Help us keep HouseRentLk safe for everyone.</p>

                        <div className="space-y-6">
                            {/* Reason */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Report</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold text-sm outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Fake Listing / Incorrect Address">Fake Listing / Incorrect Address</option>
                                    <option value="Incorrect Price / Hidden Charges">Incorrect Price / Hidden Charges</option>
                                    <option value="Offensive Content / Hate Speech">Offensive Content / Hate Speech</option>
                                    <option value="Spam / Multiple Postings">Spam / Multiple Postings</option>
                                    <option value="Misleading Photos">Misleading Photos</option>
                                    <option value="Listing Already Rented">Listing Already Rented</option>
                                    <option value="Other / Unusual Activity">Other / Unusual Activity</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What happened? (Detailed)</label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder="Please provide more context or evidence..."
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-medium text-sm resize-none focus:border-red-500 outline-none transition-colors"
                                />
                                <div className="text-[10px] text-slate-400 mt-2 font-bold flex justify-end">
                                    {reportDescription.length}/1000
                                </div>
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Attachment (Optional)</label>
                                {screenshotPreview ? (
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                                        <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-40 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setReportScreenshot(null);
                                                    setScreenshotPreview(null);
                                                }}
                                                className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer hover:border-red-400 dark:hover:border-red-500">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Attach Screenshot</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotChange} />
                                    </label>
                                )}
                            </div>

                            {/* Contact Email */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Email (For follow-up)</label>
                                <input
                                    type="email"
                                    value={reportContactEmail}
                                    onChange={(e) => setReportContactEmail(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold text-sm outline-none focus:border-red-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => {
                                    setShowReport(false);
                                    setReportScreenshot(null);
                                    setScreenshotPreview(null);
                                }}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={submittingReport}
                                className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            >
                                {submittingReport ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Submit Report <Send className="h-3 w-3" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <ListingHeader
                title={title}
                isFav={isFavorite(id)}
                handleShare={handleShare}
                handleFavorite={handleFavorite}
                handleReport={() => setShowReport(true)}
            />

            <ListingGallery
                images={displayImages}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
                setLightboxOpen={setLightboxOpen}
                isUrgent={isUrgent}
                marketInsight={marketInsight}
                virtualTourUrl={virtualTourUrl}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-10 md:space-y-16">
                    <div>
                        {/* Tags Row */}
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
                            <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest ml-auto">
                                <Calendar className="h-4 w-4" /> Posted {formatTimeAgo(createdAt)}, posted at {formatFullDate(createdAt)}
                            </span>
                        </div>

                        {/* AI Auto-Tags */}
                        {autoTags && autoTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {autoTags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-violet-100 dark:border-violet-800">
                                        <Tag className="h-3 w-3" /> {tag.label || tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-start text-slate-500 dark:text-slate-400 font-bold text-2xl mb-10 mt-6">
                            {/* Use MapPin import or rely on the one inside ListingMap? Actually I removed MapPin import usage here. Let's add it back or just text. The original had MapPin icon. */}
                            {/* I need to import MapPin to use it here. */}
                            {displayAddress}
                        </div>

                        <ListingStats beds={beds} baths={baths} size={size} type={type} />

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

                    <ListingMarketIntelligence
                        marketInsight={marketInsight}
                        price={price}
                        town={location?.town}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <RentalDepositPlanner defaultRent={price} />
                        <RentAffordabilityCalculator />
                    </div>

                    <ListingMap listing={listing} aiDescription={aiDescription} />

                    <ListingSafety areaSafety={areaSafety} />

                    <ListingDescription
                        description={description}
                        houseRules={houseRules}
                        amenities={amenities}
                        aiDescription={aiDescription}
                    />

                    <ListingReviews
                        reviews={reviews}
                        user={user}
                        listingId={id}
                        onReviewAdded={handleReviewAdded}
                        reviewSentiment={reviewSentiment}
                    />

                    <ListingSimilar similarListings={similarListings} />
                </div>

                <ListingSidebar
                    listing={listing}
                    priceFairness={priceFairness}
                    user={user}
                />
            </div>
        </div>
    );
};

export default ListingDetail;
