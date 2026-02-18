import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]); // Array of listing IDs
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchFavorites(parsedUser.token);
        }
        setLoading(false);
    }, []);

    const fetchFavorites = async (token) => {
        try {
            // We need to make sure we use the token for this request even if it's not set in interceptor yet (init load)
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await API.get('/favorites', config);
            // Assuming data is array of favorite objects populated with listingId. 
            // We just need IDs for checking status usually. 
            // But if we want to display them, we keep full objects or map to IDs.
            // Let's store IDs for quick lookup.
            setFavorites(data.map(fav => fav.listingId._id || fav.listingId));
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    };

    const toggleFavorite = async (listingId) => {
        if (!user) {
            toast.error("Please login to save favorites");
            return false;
        }

        try {
            const isFav = favorites.includes(listingId);
            if (isFav) {
                await API.delete(`/favorites/${listingId}`);
                setFavorites(prev => prev.filter(id => id !== listingId));
                toast.success("Removed from favorites");
            } else {
                await API.post('/favorites', { listingId });
                setFavorites(prev => [...prev, listingId]);
                toast.success("Added to favorites");
            }
            return !isFav;
        } catch (error) {
            console.error("Error toggling favorite", error);
            toast.error("Failed to update favorite");
            return false;
        }
    };

    const isFavorite = (listingId) => favorites.includes(listingId);

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            fetchFavorites(data.token);
            toast.success('Login successful!');
            return { success: true, user: data };
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, user: null };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await API.post('/auth/register', userData);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Registration successful!');
            return { success: true, user: data };
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, user: null };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, favorites, toggleFavorite, isFavorite }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
