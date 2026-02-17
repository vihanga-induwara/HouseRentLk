import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
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
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
