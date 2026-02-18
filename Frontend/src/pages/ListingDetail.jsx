import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { MapPin, Bed, Bath, Layout, Share2, Heart, Shield, Check, Phone, Mail, ArrowLeft, Calendar } from 'lucide-react';
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

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await API.get(`/listings/${id}`);
                setListing(res.data);

                // Track recently viewed in localStorage
                try {
                    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const filtered = viewed.filter(v => v.id !== id);
                    filtered.unshift({ id, viewedAt: new Date().toISOString() });
                    // Keep only last 50 entries
                    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 50)));
                } catch (e) { /* ignore localStorage errors */ }
            } catch (err) {
                setError("Failed to load listing details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error || !listing) return <div className="text-center py-10 text-red-500">{error || "Listing not found"}</div>;

    // Destructure specifically to handle nested or missing fields safely
    const {
        title, price, location, description,
        beds, baths, size, type,
        images, amenities, owner,
        contactDetails, aiDescription = {}
    } = listing;

    const displayAddress = location ? `${location.address}, ${location.town}` : 'Address Unavailable';
    const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x400'];

    const isFav = isFavorite(id);

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
        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }
        await toggleFavorite(id);
    };

    return (
        <div className="max-w-6xl mx-auto">
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

            {/* Gallery Grid - Modern Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[500px] mb-10">
                <div className="h-full relative group">
                    <img
                        src={displayImages[0]}
                        alt="Main View"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 h-full">
                    {displayImages.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="h-full relative overflow-hidden group">
                            <img
                                src={img}
                                alt="Interior"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {idx === 3 && displayImages.length > 5 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                    <span className="text-white font-bold text-lg">+ {displayImages.length - 5} photos</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Header Info */}
                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                                <div className="flex items-center text-slate-500 font-medium">
                                    <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                                    {displayAddress}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary-600">
                                    LKR {listing.price?.toLocaleString() || 'N/A'}
                                </div>
                                <div className="text-slate-500 text-sm font-medium">per month</div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 py-6 border-y border-slate-100">
                            {[
                                { label: 'Bedrooms', value: listing.beds, icon: Bed },
                                { label: 'Bathrooms', value: listing.baths, icon: Bath },
                                { label: 'Square Ft', value: listing.size, icon: Layout },
                                { label: 'Property Type', value: listing.type, icon: Shield },
                            ].map((stat, i) => (
                                <div key={i} className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                    <stat.icon className="h-6 w-6 text-primary-500 mb-2" />
                                    <span className="block font-bold text-slate-900 text-lg">{stat.value}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About this home</h2>

                        {/* AI Generated Description */}
                        {/* AI Generated Description */}
                        {aiDescription && aiDescription.description ? (
                            <div className="mb-6 prose prose-slate max-w-none text-slate-600 leading-relaxed bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                                <div className="flex items-center gap-2 mb-2 text-primary-700 font-semibold text-sm uppercase tracking-wide">
                                    <span className="flex h-2 w-2 rounded-full bg-primary-500"></span>
                                    AI Insight
                                </div>
                                {aiDescription.description}
                            </div>
                        ) : null}

                        {/* Town Vibe */}
                        {aiDescription && aiDescription.townVibe ? (
                            <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Location Vibe: {location?.town}</h3>
                                <p className="text-slate-600 leading-relaxed italic">
                                    "{aiDescription.townVibe}"
                                </p>
                            </div>
                        ) : null}

                        {/* Original Description */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Owner's Note</h3>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                {description}
                            </div>
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

                    {/* Location Map Placeholder */}
                    {/* Location Map */}
                    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-80 relative bg-slate-100">
                        {location?.coordinates?.coordinates ? (
                            <iframe
                                title="Property Location"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${location.coordinates.coordinates[1]},${location.coordinates.coordinates[0]}&z=15&output=embed`}
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                    <span className="font-semibold">Map not available for this location</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Contact Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl border-2 border-white shadow-md">
                                {owner?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{owner?.name || 'User'}</p>
                                <div className="flex items-center text-sm font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {owner?.verified ? 'Verified Owner' : 'Owner'}
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact Info */}
                        <div className="space-y-4 mb-6">
                            {contactDetails?.availableTimes && (
                                <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Calendar className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-slate-900 block">Available for calls:</span>
                                        {contactDetails.availableTimes}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="space-y-4">
                            <Input placeholder="Your Name" className="bg-slate-50" />
                            <Input placeholder="Email Address" type="email" className="bg-slate-50" />
                            <Input placeholder="Phone (Optional)" className="bg-slate-50" />
                            <textarea
                                className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-3 border h-32 bg-slate-50 text-slate-800 placeholder:text-slate-400 resize-none"
                                placeholder="I am interested in this property..."
                                defaultValue={contactDetails?.whatsappMsg || `Hi, I'm interested in "${title}".`}
                            ></textarea>

                            {contactDetails?.whatsapp && (
                                <a
                                    href={`https://wa.me/${contactDetails.whatsapp}?text=${encodeURIComponent(contactDetails.whatsappMsg || `Hi, I'm interested in ${title}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button type="button" className="w-full py-3.5 text-lg font-bold shadow-lg shadow-green-500/30 rounded-xl bg-green-500 hover:bg-green-600 mb-3">
                                        WhatsApp Owner
                                    </Button>
                                </a>
                            )}

                            <Button className="w-full py-3.5 text-lg font-bold shadow-lg shadow-primary-500/30 rounded-xl">
                                Send Email
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
                            <Button variant="outline" className="w-full gap-2 rounded-xl py-3 border-slate-200">
                                <Phone className="h-4 w-4" />
                                {owner?.phone || 'Show Primary Phone'}
                            </Button>

                            {contactDetails?.phone2 && (
                                <Button variant="outline" className="w-full gap-2 rounded-xl py-3 border-slate-200">
                                    <Phone className="h-4 w-4" />
                                    {contactDetails.phone2} (Alt)
                                </Button>
                            )}

                            <p className="text-xs text-slate-400 mt-4 text-center">
                                By sending a message, you agree to our Terms of Use and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default ListingDetail;
