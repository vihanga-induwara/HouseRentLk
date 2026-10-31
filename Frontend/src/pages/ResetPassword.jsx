import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../utils/api';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { PASSWORD_RULE, isStrongPassword } from '../utils/validation';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordError = password && !isStrongPassword(password) ? PASSWORD_RULE : '';
    const confirmError = confirm && confirm !== password ? 'Passwords do not match' : '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordError || confirmError || !password) return;

        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/reset-password', { token, password });
            toast.success(data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not reset your password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard icon={LockKeyhole} title="Choose a new password">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    id="password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    required
                />
                <Input
                    id="confirm"
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={confirmError}
                    required
                />
                <Button type="submit" className="w-full py-3" isLoading={isLoading}>
                    Update password
                </Button>
                <p className="text-center text-sm text-slate-500">
                    Link expired? <Link to="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-500">Request a new one</Link>
                </p>
            </form>
        </AuthCard>
    );
};

export default ResetPassword;
