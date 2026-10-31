import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../utils/api';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentMessage, setSentMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/forgot-password', { email });
            setSentMessage(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not send the reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard icon={KeyRound} title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
            {sentMessage ? (
                <div className="space-y-6 text-center">
                    <p className="p-4 rounded-xl bg-green-50 text-green-800 text-sm">{sentMessage}</p>
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 text-sm">Back to login</Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                    <Button type="submit" className="w-full py-3" isLoading={isLoading}>
                        Send reset link
                    </Button>
                    <p className="text-center text-sm text-slate-500">
                        Remembered it? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">Log in</Link>
                    </p>
                </form>
            )}
        </AuthCard>
    );
};

export default ForgotPassword;
