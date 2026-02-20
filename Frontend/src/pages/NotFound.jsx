import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
                <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>

            <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-700 mb-6">Page Not Found</h2>

            <p className="text-slate-500 max-w-md mb-8 text-lg">
                Oops! The page you're looking for doesn't seem to exist. It might have been moved or deleted.
            </p>

            <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary-500/20 transform hover:-translate-y-1"
            >
                <Home className="h-5 w-5" />
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
