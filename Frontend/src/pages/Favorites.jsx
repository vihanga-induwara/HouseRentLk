import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Home, Bed, Bath, Maximize, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';

const Favorites = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [user, navigate]);

    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const { data } = await API.get('/favorites');
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Failed to load favorites');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (listingId) => {
        try {
            await API.delete(`/favorites/${listingId}`);
            setFavorites(favorites.filter(fav => fav.listingId?._id !== listingId));
            toast.success('Removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Failed to remove favorite');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-slate-500">Loading favorites...</div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Favorites</h1>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <Heart className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md">
                        Start exploring properties and save your favorites by clicking the heart icon
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Browse Properties
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
                    <p className="text-slate-500 mt-1">{favorites.length} saved properties</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                    const listing = favorite.listingId;
                    if (!listing) return null;

                    return (
                        <div
                            key={favorite._id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            {/* Image */}
                            <div
                                className="relative h-56 bg-slate-200 cursor-pointer"
                                onClick={() => navigate(`/listings/${listing._id}`)}
                            >
                                <img
                                    src={listing.images?.[0] || NO_IMAGE_PLACEHOLDER}
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(listing._id);
                                        }}
                                        className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all"
                                        title="Remove from favorites"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                {listing.isUrgent && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            Urgent
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => navigate(`/listings/${listing._id}`)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 flex-1">
                                        {listing.title}
                                    </h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ml-2">
                                        {listing.type}
                                    </span>
                                </div>

                                <div className="flex items-center text-slate-500 text-sm mb-3">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {listing.location?.town || 'Location not specified'}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                    {listing.beds && (
                                        <div className="flex items-center">
                                            <Bed className="h-4 w-4 mr-1" />
                                            {listing.beds}
                                        </div>
                                    )}
                                    {listing.baths && (
                                        <div className="flex items-center">
                                            <Bath className="h-4 w-4 mr-1" />
                                            {listing.baths}
                                        </div>
                                    )}
                                    {listing.size && (
                                        <div className="flex items-center">
                                            <Maximize className="h-4 w-4 mr-1" />
                                            {listing.size} sqft
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <div className="text-2xl font-bold text-primary-600">
                                            LKR {listing.price?.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-500">per month</div>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Saved {new Date(favorite.savedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Favorites;
