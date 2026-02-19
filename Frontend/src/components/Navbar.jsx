import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, LogOut, Heart, List, MessageSquare, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth(); // Use Auth Context

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rentals', path: '/browse' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm dark:shadow-slate-800/50 py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-500 rounded-lg p-1.5 text-white transition-transform group-hover:scale-110">
                            <Home className="h-5 w-5" />
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-slate-100'}`}>
                            HouseRent<span className="text-primary-500">Lk</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Welcome, {user.name}
                                </span>
                                <Link to="/post-ad">
                                    <Button size="sm" className="rounded-full px-4 bg-primary-600 hover:bg-primary-700 text-white border-0">
                                        + Post Ad
                                    </Button>
                                </Link>
                                <Link to="/favorites">
                                    <Button size="sm" variant="outline" className="rounded-full px-4 border-slate-200">
                                        <Heart className="h-4 w-4 mr-2" />
                                        Favorites
                                    </Button>
                                </Link>
                                <Link to="/my-listings">
                                    <Button size="sm" variant="outline" className="rounded-full px-4 border-slate-200">
                                        <List className="h-4 w-4 mr-2" />
                                        My Listings
                                    </Button>
                                </Link>
                                <Link to="/owner/leads">
                                    <Button size="sm" variant="outline" className="rounded-full px-4 border-slate-200">
                                        <Users className="h-4 w-4 mr-2" />
                                        Leads
                                    </Button>
                                </Link>
                                <Link to="/inbox">
                                    <Button size="sm" variant="outline" className="rounded-full px-4 border-slate-200">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Inbox
                                    </Button>
                                </Link>
                                <NotificationBell />
                                <Link to="/profile">
                                    <Button size="sm" variant="outline" className="rounded-full px-4 border-slate-200">
                                        <User className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={logout}
                                    className="rounded-full px-4 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link to="/post-ad">
                                    <Button size="sm" className="rounded-full px-6 shadow-none hover:shadow-md bg-primary-600 hover:bg-primary-700 text-white border-0">
                                        + Post Ad
                                    </Button>
                                </Link>
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600">
                                    Log in
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-6 shadow-none hover:shadow-md">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 shadow-lg dark:shadow-slate-800/50 py-4 px-4 flex flex-col space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
                        <ThemeToggle />
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>

                    {user ? (
                        <>
                            <span className="text-base font-medium text-slate-700 dark:text-slate-200 block px-2">
                                Hi, {user.name}
                            </span>
                            <Link to="/my-listings" onClick={() => setIsOpen(false)}>
                                <Button variant="outline" className="w-full justify-center rounded-xl border-slate-200">
                                    <List className="h-4 w-4 mr-2" /> My Listings
                                </Button>
                            </Link>
                            <Link to="/owner/leads" onClick={() => setIsOpen(false)}>
                                <Button variant="outline" className="w-full justify-center rounded-xl border-slate-200">
                                    <Users className="h-4 w-4 mr-2" /> Leads
                                </Button>
                            </Link>
                            <Button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                variant="outline"
                                className="w-full justify-center rounded-xl border-slate-200 text-red-600"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-base font-medium text-slate-600 hover:text-primary-600 px-2"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button className="w-full rounded-full">Sign up</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
