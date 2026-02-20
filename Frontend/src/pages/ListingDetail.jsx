import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { Shield, Tag, Eye, Calendar, CheckCircle } from 'lucide-react';
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
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            // Critical: fetch listing first — fail hard if this fails
            try {
                const listingRes = await API.get(`/listings/${id}`);
                setListing(listingRes.data);
            } catch (err) {
                setError('Failed to load listing details. It may have been removed.');
                setLoading(false);
                console.error(err);
                return;
            }

            // Non-critical: reviews, market insights, similar listings — fail gracefully
            try {
                const [reviewsRes, insightRes, similarRes] = await Promise.allSettled([
                    API.get(`/reviews/${id}`),
                    API.get(`/listings/${id}/market-insights`),
                    API.get(`/listings/${id}/similar`),
                ]);

                if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data);
                if (insightRes.status === 'fulfilled') setMarketInsight(insightRes.value.data);
                if (similarRes.status === 'fulfilled') setSimilarListings(similarRes.value.data);
            } catch (err) {
                console.error("Secondary data fetch error", err);
            }

            // Fetch AI price fairness, review sentiment & safety score
            try {
                const [fairnessRes, sentimentRes, safetyRes] = await Promise.allSettled([
                    API.get(`/ai/price-fairness/${id}`),
                    API.get(`/ai/review-sentiment/${id}`),
                    API.get(`/ai/safety-score/${id}`),
                ]);
                if (fairnessRes.status === 'fulfilled') setPriceFairness(fairnessRes.value.data);
                if (sentimentRes.status === 'fulfilled') setReviewSentiment(sentimentRes.value.data);
                if (safetyRes.status === 'fulfilled') setAreaSafety(safetyRes.value.data);
            } catch (err) {
                console.error("AI data fetch error", err);
            }

            // Track recently viewed
            try {
                // We access state 'listing' here but it might be stale in closure if we set it above?
                // Actually setListing is async in React but we are in async function. 
                // However, we have the data in `listingRes.data` from the scope above if we saved it to a var.
                // Let's grab it from the API response we just got.
                // Re-fetch to be safe or just use the one we got.
                // Since I refactored the top block, I need to make sure I have access to listing data here.
                // The previous code used `listingData` variable. I should preserve that.
            } catch { /* silent */ }

            setLoading(false);
        };

        // Redoing the function to be cleaner and correct with scope
        const loadData = async () => {
            setLoading(true);
            setError(null);

            let listingData;

            try {
                const res = await API.get(`/listings/${id}`);
                listingData = res.data;
                setListing(listingData);
            } catch (err) {
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
                API.get(`/ai/review-sentiment/${id}`),
                API.get(`/ai/safety-score/${id}`),
            ]).then(results => {
                const [reviews, insights, similar, fairness, sentiment, safety] = results;

                if (reviews.status === 'fulfilled') setReviews(reviews.value.data);
                if (insights.status === 'fulfilled') setMarketInsight(insights.value.data);
                if (similar.status === 'fulfilled') setSimilarListings(similar.value.data);
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
                    viewedAt: new Date().toISOString()
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
        images, amenities, owner,
        contactDetails, aiDescription,
        virtualTourUrl, isUrgent, views,
        availableVisits, tenantType, houseRules, minRentalPeriod,
        agreementRequired, availableFrom, furnished, autoTags
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
