import axios from 'axios';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        // Required by the API's CSRF guard on state-changing requests
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Requests whose 401 means "wrong credentials", not "session expired"
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/me'];

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !AUTH_ENDPOINTS.some(path => url.includes(path))) {
            window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
        }
        return Promise.reject(error);
    }
);

export default API;
