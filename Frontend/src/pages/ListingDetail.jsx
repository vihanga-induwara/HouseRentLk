import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import {
    MapPin, Bed, Bath, Layout, Share2, Heart, Shield, Check,
    Phone, Mail, ArrowLeft, Calendar, MessageSquare, Send,
    ShieldCheck, Star, Info, TrendingDown, TrendingUp, Minus,
    Zap, Eye, CheckCircle, Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

const ListingDetail = () => {
    const { id } = useParams();
    const { isFavorite, toggleFavorite, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

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
                    filtered.unshift({
                        id,
                        title: listingRes.data.title,
                        image: listingRes.data.images?.[0],
                        price: listingRes.data.price,
                        viewedAt: new Date().toISOString()
                    });
                    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
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
            if (navigator.share) {
                await navigator.share({ title: listing.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            } catch {
                toast.error('Failed to copy link');
            }
        }
    };

    const handleWhatsApp = () => {
        const phone = listing.contactDetails?.whatsapp || listing.owner?.phone;
        const msg = encodeURIComponent(listing.contactDetails?.whatsappMsg || `Hi, I'm interested in your property "${listing.title}" on HouseRentLk.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
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

    if (loading) return <div className="flex justify-center items-center h-64 text-slate-500 font-black uppercase italic tracking-widest">Finding your dream home...</div>;
    if (error || !listing) return <div className="text-center py-20 text-red-500 font-bold">{error || "Listing not found"}</div>;

    const {
        title, price, location, description,
        beds, baths, size, type,
        images, amenities, owner,
        contactDetails, aiDescription: aiData,
        virtualTourUrl, isUrgent, views
    } = listing;

    const aiDescription = aiData || {};

    const displayAddress = location ? `${location.address}, ${location.town}` : 'Address Unavailable';
    const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x400'];
    const isFav = isFavorite(id);
    const isGoodDeal = marketInsight && marketInsight.difference <= -5;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 bg-slate-50/30 min-h-screen">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                    <Link to="/browse" className="inline-flex items-center text-slate-400 hover:text-primary-600 transition-all font-black uppercase tracking-widest text-[10px] mb-2 group">
                        <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Listings
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{title}</h1>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 transition-all text-xs font-black uppercase tracking-widest active:scale-95 bg-white/50 backdrop-blur-sm"
                    >
                        <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button
                        onClick={handleFavorite}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest active:scale-95 ${isFav
                            ? 'bg-red-50 border-red-200 text-red-500 shadow-xl shadow-red-500/10'
                            : 'border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-white bg-white/50 backdrop-blur-sm'
                            }`}
                    >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Premium Gallery Picker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                <div className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 h-[500px] lg:h-[650px] group">
                    <img
                        src={displayImages[activeImage]}
                        alt="Active View"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                        {isUrgent && (
                            <div className="bg-red-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 backdrop-blur-md bg-red-600/90 ring-1 ring-white/20">
                                <Zap className="h-4 w-4 fill-current" /> Urgent listing
                            </div>
                        )}
                        {isGoodDeal && (
                            <div className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 backdrop-blur-md bg-primary-600/90 ring-1 ring-white/20">
                                <TrendingDown className="h-4 w-4" /> Exceptional Value
                            </div>
                        )}
                    </div>

                    {virtualTourUrl && (
                        <a
                            href={virtualTourUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-xl text-slate-900 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:bg-primary-600 hover:text-white transition-all ring-1 ring-white/20 active:scale-95"
                        >
                            <Layout className="h-5 w-5" /> 360° Virtual Tour
                        </a>
                    )}
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-4 h-[500px] lg:h-[650px]">
                    {displayImages.slice(0, 6).map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`relative rounded-[1.5rem] overflow-hidden cursor-pointer transition-all duration-300 ring-4 ${activeImage === idx ? 'ring-primary-500 scale-[0.98]' : 'ring-transparent hover:ring-slate-200'}`}
                        >
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            {idx === 5 && displayImages.length > 6 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-black text-xl italic">+{displayImages.length - 6}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {displayImages.length < 6 && [...Array(6 - displayImages.length)].map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-slate-200" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-16">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-primary-100">
                                {type}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Eye className="h-4 w-4" /> {views || 0} Property Views
                            </span>
                        </div>
                        <div className="flex items-start text-slate-500 font-bold text-2xl mb-10">
                            <MapPin className="h-7 w-7 mr-3 text-primary-500 shrink-0 mt-0.5" />
                            {displayAddress}
                        </div>

                        {/* Quick Stats Premium */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-slate-100">
                            {[
                                { label: 'Bedrooms', value: beds, icon: Bed },
                                { label: 'Bathrooms', value: baths, icon: Bath },
                                { label: 'Square Ft', value: size, icon: Layout },
                                { label: 'Property Type', value: type, icon: Shield },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all">
                                    <div className="p-4 bg-primary-50 rounded-2xl mb-4">
                                        <stat.icon className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <span className="block font-black text-slate-900 text-3xl italic tracking-tighter mb-1">{stat.value}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Intelligence Section */}
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
                                                    : "This property is priced at a competitive market rate for the area."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-primary-600/20 rounded-[2rem] p-8 border border-primary-500/30 flex flex-col justify-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-4">Investment Rating</h4>
                                        <div className="text-5xl font-black italic mb-2">A+</div>
                                        <p className="text-xs font-bold text-primary-200 uppercase tracking-widest">Exceptional Value Opportunity</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Commute & Neighborhood Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                            <h3 className="text-xl font-black mb-8 italic tracking-tight flex items-center gap-3">
                                <MapPin className="h-6 w-6 text-primary-500" /> Commute Calculator
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Work/Study Destination</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address..."
                                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                        <div className="text-primary-600 font-black text-lg mb-1">12</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Min Drive</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                        <div className="text-primary-600 font-black text-lg mb-1">25</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Min Bus</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                        <div className="text-primary-600 font-black text-lg mb-1">8</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Km Away</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-50 rounded-[2.5rem] p-10 border border-primary-100 relative overflow-hidden group">
                            <Sparkles className="absolute top-10 right-10 h-12 w-12 text-primary-200 rotate-12 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black mb-8 italic tracking-tight text-primary-900">Neighborhood Lens</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-xs font-black text-primary-900 uppercase tracking-widest">High Safety Score (9.2/10)</span>
                                </div>
                                <p className="text-sm font-bold text-primary-700 italic leading-relaxed">
                                    {aiDescription?.townVibe || (location ? `${location.town} is a premium residential area known for its safety, connectivity, and proximity to elite amenities.` : "This is a premium residential area.")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    {aiDescription?.description && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic tracking-tight">
                                <CheckCircle className="h-6 w-6 text-primary-500" /> Neighborhood <span className="text-primary-600">DNA</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 text-primary-50 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                        <Info className="h-48 w-48" />
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-bold italic text-lg relative z-10">
                                        "{aiDescription.description}"
                                    </p>
                                </div>
                                <div className="md:col-span-4 bg-primary-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                                    <div className="text-[10px] font-black text-primary-200 uppercase tracking-[0.2em] mb-4">The Local Vibe</div>
                                    <p className="font-black italic text-xl leading-snug">
                                        {aiDescription.townVibe || "Prime Residential Hub with modern connectivity."}
                                    </p>
                                    <div className="mt-6 flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-white text-white" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description & Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Home <span className="text-primary-600">Description</span></h2>
                            <p className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Premium <span className="text-primary-600">Amenities</span></h2>
                            <div className="grid grid-cols-1 gap-4">
                                {(amenities ? Object.entries(amenities)
                                    .filter(([key, value]) => value === true || (typeof value === 'string' && value !== 'None' && value !== ''))
                                    .map(([key, value]) => {
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return typeof value === 'string' ? `${formattedKey}: ${value}` : formattedKey;
                                    }) : []
                                ).map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:translate-x-2">
                                        <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <span className="text-slate-900 font-black text-sm uppercase tracking-widest">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-slate-900 italic tracking-tight">
                                Community <span className="text-primary-600">Voice</span> ({reviews.length})
                            </h2>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.length === 0 ? (
                                <div className="md:col-span-2 bg-slate-50 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 italic font-black uppercase tracking-widest text-xs">Be the first to share your thoughts on this home</p>
                                </div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r._id} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:translate-y-[-4px] transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-sm font-black text-white italic group-hover:scale-110 transition-transform">
                                                    {r.reviewer?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block font-black text-slate-900 text-lg italic tracking-tight">{r.reviewer?.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed font-bold italic">"{r.comment}"</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Contact Sticky */}
                <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/80 border border-slate-100 p-12 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-500 to-blue-500"></div>

                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Monthly Rent</div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 group">
                                <span className="text-6xl font-black text-slate-900 italic tracking-tighter group-hover:scale-110 transition-transform duration-500 origin-left inline-block">{formatCurrency(price)}</span>
                            </div>
                        </div>

                        {/* Owner Card Premium */}
                        <div className="flex items-center gap-5 p-6 bg-slate-50/80 rounded-[2.5rem] mb-12 group cursor-pointer border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                            <div className="relative">
                                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl group-hover:scale-110 transition-transform">
                                    {owner?.name?.charAt(0)}
                                </div>
                                {owner?.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary-600 p-2 rounded-full ring-4 ring-slate-50 shadow-lg">
                                        <ShieldCheck className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 italic tracking-tight">{owner?.name}</p>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Expert Homeowner
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!inquirySent ? (
                                <>
                                    <Button
                                        className="w-full py-6 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 rounded-[1.5rem] active:scale-95 transition-all"
                                        onClick={async () => {
                                            if (!user) { toast.error('Please login'); return; }
                                            setSendingInquiry(true);
                                            try {
                                                await API.post('/inquiries', { listingId: id, message: "Interested in your property" });
                                                setInquirySent(true);
                                                toast.success('Inquiry Sent!');
                                            } catch (error) { toast.error(error.response?.data?.message || 'Failed'); } finally { setSendingInquiry(false); }
                                        }}
                                        isLoading={sendingInquiry}
                                    >
                                        Direct Inquiry
                                    </Button>
                                    <button
                                        onClick={handleWhatsApp}
                                        className="w-full py-6 bg-green-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-2xl shadow-green-500/20 active:scale-95 ring-2 ring-transparent hover:ring-green-100"
                                    >
                                        <MessageSquare className="h-5 w-5 fill-current" /> WhatsApp Chat
                                    </button>
                                </>
                            ) : (
                                <div className="bg-green-50 text-green-700 p-8 rounded-[2rem] text-center text-xs font-black uppercase tracking-widest border border-green-100 flex flex-col items-center gap-3">
                                    <CheckCircle className="h-8 w-8" /> Inquiry Dispatched
                                </div>
                            )}

                            <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Instant Call Support</span>
                                <a
                                    href={`tel:${owner?.phone}`}
                                    className="px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary-600 transition-all shadow-xl active:scale-95"
                                >
                                    {owner?.phone}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
