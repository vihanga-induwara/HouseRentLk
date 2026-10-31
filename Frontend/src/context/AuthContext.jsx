/* eslint-disable react-refresh/only-export-components -- context file exports its hook alongside the provider */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API, { AUTH_UNAUTHORIZED_EVENT } from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const readStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);
    const [favorites, setFavorites] = useState([]); // Array of listing IDs
    const [loading, setLoading] = useState(true);

    const saveUser = useCallback((userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    }, []);

    const fetchFavorites = useCallback(async () => {
        try {
            const { data } = await API.get('/favorites');
            // Store IDs for quick lookup. Filter out null listingId (deleted listings)
            setFavorites(data
                .filter(fav => fav.listingId)
                .map(fav => fav.listingId._id || fav.listingId)
            );
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    }, []);

    // Re-load the full user (verification flags, status, etc.) from the server
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await API.get('/auth/me');
            saveUser(data);
            return data;
        } catch {
            saveUser(null);
            return null;
        }
    }, [saveUser]);

    // Validate any stored session with the server on first load
    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            if (readStoredUser()) {
                const freshUser = await refreshUser();
                if (freshUser && !cancelled) fetchFavorites();
            }
            if (!cancelled) setLoading(false);
        };
        init();
        return () => { cancelled = true; };
    }, [refreshUser, fetchFavorites]);

    // The API client fires this event whenever the server answers 401
    useEffect(() => {
        const handleUnauthorized = () => {
            if (readStoredUser()) {
                saveUser(null);
                setFavorites([]);
                toast.error('Your session has expired. Please log in again.');
            }
        };
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [saveUser]);

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
            saveUser(data);
            fetchFavorites();
            toast.success('Login successful!');
            return { success: true, user: data };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, user: null };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await API.post('/auth/register', userData);
            saveUser(data);
            toast.success('Registration successful!');
            return { success: true, user: data };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, user: null };
        }
    };

    const updateUser = (userData) => saveUser(userData);

    const logout = async () => {
        try {
            await API.post('/auth/logout');
        } catch (e) {
            console.error("Logout API error", e);
        }
        saveUser(null);
        setFavorites([]);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, refreshUser, loading, favorites, toggleFavorite, isFavorite }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
