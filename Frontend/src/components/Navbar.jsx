import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, LogOut, Heart, List, MessageSquare, Users, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rentals', path: '/browse' },
        { name: 'Brokers', path: '/brokers' },
        { name: 'Budget Planner', path: '/rent-planner' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm dark:shadow-slate-800/50 py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary-500 rounded-lg p-1.5 text-white transition-transform group-hover:scale-110 shadow-lg shadow-primary-500/30">
                                <Home className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <span className={`text-lg md:text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-slate-100'}`}>
                                HouseRent<span className="text-primary-500">Lk</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Links - Left Aligned */}
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${location.pathname === link.path
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                                <NotificationBell />

                                <Link to="/post-ad">
                                    <Button size="sm" className="rounded-full px-5 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-md shadow-primary-500/20">
                                        + Post Ad
                                    </Button>
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 group focus:outline-none"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-slate-200 dark:border-slate-700 group-hover:border-primary-500 transition-colors">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                            </div>

                                            <div className="py-1">
                                                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                                <Link to="/my-listings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <List className="h-4 w-4" />
                                                    My Listings
                                                </Link>
                                                <Link to="/favorites" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <Heart className="h-4 w-4" />
                                                    Favorites
                                                </Link>
                                                <Link to="/owner/leads" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <Users className="h-4 w-4" />
                                                    Leads
                                                </Link>
                                                <Link to="/inbox" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <MessageSquare className="h-4 w-4" />
                                                    Inbox
                                                </Link>
                                                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 transition-colors" onClick={() => setDropdownOpen(false)}>
                                                    <User className="h-4 w-4" />
                                                    Profile
                                                </Link>
                                            </div>

                                            <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                                <Link to="/post-ad">
                                    <Button size="sm" className="hidden lg:flex rounded-full px-5 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-md shadow-primary-500/20">
                                        + Post Ad
                                    </Button>
                                </Link>
                                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-6 shadow-none hover:shadow-md">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl py-4 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-4 flex flex-col space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

                        {user ? (
                            <>
                                <div className="px-3 py-2">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Signed in as</span>
                                    <span className="block text-base font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                                </div>

                                <Link to="/post-ad" onClick={() => setIsOpen(false)} className="block">
                                    <Button className="w-full justify-center rounded-xl bg-primary-600 text-white border-0 shadow-lg shadow-primary-500/20">
                                        + Post Ad
                                    </Button>
                                </Link>

                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center rounded-xl text-sm h-auto py-3">
                                            <LayoutDashboard className="h-4 w-4 mb-1 block" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link to="/my-listings" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center rounded-xl text-sm h-auto py-3">
                                            <List className="h-4 w-4 mb-1 block" />
                                            Listings
                                        </Button>
                                    </Link>
                                    <Link to="/inbox" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center rounded-xl text-sm h-auto py-3">
                                            <MessageSquare className="h-4 w-4 mb-1 block" />
                                            Inbox
                                        </Button>
                                    </Link>
                                    <Link to="/owner/leads" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center rounded-xl text-sm h-auto py-3">
                                            <Users className="h-4 w-4 mb-1 block" />
                                            Leads
                                        </Button>
                                    </Link>
                                </div>

                                <Button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    variant="outline"
                                    className="w-full justify-center rounded-xl border-red-100 text-red-600 hover:bg-red-50 mt-2"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-3 pt-2">
                                <Link to="/post-ad" onClick={() => setIsOpen(false)} className="block">
                                    <Button className="w-full justify-center rounded-xl bg-primary-600 text-white border-0 shadow-md shadow-primary-500/20">
                                        + Post Ad
                                    </Button>
                                </Link>
                                <div className="flex gap-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1">
                                        <Button variant="outline" className="w-full justify-center rounded-xl">Log in</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex-1">
                                        <Button className="w-full justify-center rounded-xl">Sign up</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

