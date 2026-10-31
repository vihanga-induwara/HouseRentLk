import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // AuthContext shows the success/error toast
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            // Role-based redirection
            navigate(result.user.role === 'admin' ? '/admin' : '/');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 p-3 rounded-full inline-block mb-4">
                        <LogIn className="h-8 w-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                </div>

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

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">Forgot password?</Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" className="w-full py-3 shadow-lg shadow-primary-500/30" isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
