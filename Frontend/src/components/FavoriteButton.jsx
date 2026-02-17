import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const FavoriteButton = ({ listingId, size = 'default' }) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavoriteStatus();
        }
    }, [listingId, user]);

    const checkFavoriteStatus = async () => {
        try {
            const { data } = await API.get('/favorites');
            const favorite = data.find(fav => fav.listingId._id === listingId);
            setIsFavorite(!!favorite);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to save favorites');
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorite) {
                await API.delete(`/favorites/${listingId}`);
                setIsFavorite(false);
                toast.success('Removed from favorites');
            } else {
                await API.post('/favorites', { listingId });
                setIsFavorite(true);
                toast.success('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error(error.response?.data?.message || 'Failed to update favorites');
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        small: 'h-8 w-8',
        default: 'h-10 w-10',
        large: 'h-12 w-12'
    };

    const iconSizes = {
        small: 'h-4 w-4',
        default: 'h-5 w-5',
        large: 'h-6 w-6'
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${isFavorite
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-red-500'
                } shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''}`}
            />
        </button>
    );
};

export default FavoriteButton;
