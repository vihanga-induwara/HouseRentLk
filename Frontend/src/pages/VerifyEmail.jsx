import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MailCheck, Loader2 } from 'lucide-react';
import API from '../utils/api';
import AuthCard from '../components/AuthCard';
import { useAuth } from '../context/AuthContext';

// Tokens are single-use, so share one request per token even if the effect runs twice
// (React StrictMode mounts effects twice in development).
const verifyRequests = new Map();
const verifyToken = (token) => {
    if (!verifyRequests.has(token)) {
        verifyRequests.set(token, API.post('/auth/verify-email', { token }));
    }
    return verifyRequests.get(token);
};

const VerifyEmail = () => {
    const { token } = useParams();
    const { user, refreshUser } = useAuth();
    const [state, setState] = useState({ status: 'loading', message: '' });

    useEffect(() => {
        let cancelled = false;
        verifyToken(token)
            .then(({ data }) => {
                if (cancelled) return;
                setState({ status: 'success', message: data.message });
                if (user) refreshUser();
            })
            .catch((error) => {
                if (cancelled) return;
                setState({ status: 'error', message: error.response?.data?.message || 'Verification failed.' });
            });
        return () => { cancelled = true; };
        // Run once per token; user/refreshUser changes must not re-submit the token
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <AuthCard icon={MailCheck} title="Email verification">
            {state.status === 'loading' && (
                <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
            )}
            {state.status !== 'loading' && (
                <div className="space-y-6 text-center">
                    <p className={`p-4 rounded-xl text-sm ${state.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                        {state.message}
                    </p>
                    <Link to={user ? '/profile' : '/login'} className="font-semibold text-primary-600 hover:text-primary-500 text-sm">
                        {user ? 'Go to your profile' : 'Log in'}
                    </Link>
                </div>
            )}
        </AuthCard>
    );
};

export default VerifyEmail;
