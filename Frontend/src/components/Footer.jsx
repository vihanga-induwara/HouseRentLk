import { Home, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center mb-4">
                            <Home className="h-8 w-8 text-primary-500" />
                            <span className="ml-2 text-xl font-bold text-white">HouseRentLk</span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-4">
                            Connecting house owners and renters in Sri Lanka with trust and transparency.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                            <li><Link to="/browse" className="hover:text-primary-400 transition-colors">Browse Listings</Link></li>
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
                            <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/safety" className="hover:text-primary-400 transition-colors">Safety Tips</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>123 Main Street, Colombo 03, Sri Lanka</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>+94 11 234 5678</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>support@houserentlk.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} HouseRentLk. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
