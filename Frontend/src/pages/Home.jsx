import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import ListingCard from '../components/ListingCard';
import { formatCurrency } from '../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';

const Home = () => {
    const [featuredListings, setFeaturedListings] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await API.get('/listings?limit=3');
                setFeaturedListings(res.data.data || []);
            } catch {
                toast.error('Could not load listings. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();

        // Load recently viewed from localStorage
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setRecentlyViewed(viewed.slice(0, 4));
        } catch {
            localStorage.removeItem('recentlyViewed'); // corrupted entry
        }
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('town', searchQuery);
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            if (min) params.append('minPrice', min);
            if (max && max !== '+') params.append('maxPrice', max);
        }
        navigate(`/browse?${params.toString()}`);
    };

    return (
        <div className="space-y-20 md:space-y-32 pb-12 md:pb-20">
            {/* Hero Section - Ultra Premium */}
            <section className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden py-16 md:py-32 bg-slate-900 text-white shadow-2xl mx-4 md:mx-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center z-10 relative">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-primary-500/20 text-primary-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8 backdrop-blur-md border border-primary-500/30">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4" /> Leading Platform in Sri Lanka
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-[1.1] italic tracking-tighter">
                        Find your <span className="text-primary-500">dream</span> <br /> space with AI.
                    </h1>
                    <p className="text-base md:text-xl text-slate-300 mb-8 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                        Verified property connections, direct owner interaction, and intelligent neighborhood insights. Start your next chapter today.
                    </p>

                    {/* Search Bar - Premium Floating */}
                    <div className="bg-white/10 backdrop-blur-2xl p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-4xl mx-auto border border-white/10 flex flex-col md:flex-row gap-2 ring-1 ring-white/20">
                        <div className="flex-1 relative group">
                            <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Where do you want to live?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-14 pr-6 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border-none focus:outline-none focus:bg-white/10 text-white placeholder-slate-400 font-bold transition-all text-base md:text-lg"
                            />
                        </div>
                        <div className="hidden md:block w-px bg-white/10 my-4"></div>
                        <div className="w-full md:w-56 relative">
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-6 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-transparent border-none focus:outline-none focus:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer appearance-none transition-all"
                            >
                                <option value="" className="text-slate-900">Price Range</option>
                                <option value="0-50000" className="text-slate-900">Under 50k</option>
                                <option value="50000-100000" className="text-slate-900">50k - 100k</option>
                                <option value="100000-+" className="text-slate-900">100k+</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleSearch}
                            className="w-full md:w-auto rounded-[1.5rem] md:rounded-[2rem] px-8 md:px-12 py-4 md:py-5 text-sm font-black uppercase tracking-widest shadow-2xl bg-primary-600 hover:bg-primary-500 transition-all border-none ring-4 ring-primary-600/20"
                        >
                            Explore
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recently Viewed Component */}
            {recentlyViewed.length > 0 && (
                <section className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tight">Pick up where you <span className="text-primary-600">left off</span></h2>
                        <div className="hidden md:block h-px flex-1 bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentlyViewed.map((v) => (
                            <Link key={v.id} to={`/listings/${v.id}`} className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-xl hover:translate-y-[-4px] transition-all duration-500">
                                <img src={v.image || NO_IMAGE_PLACEHOLDER} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`${v.title} thumbnail`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h4 className="text-white font-black text-sm italic mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{v.title}</h4>
                                    <p className="text-primary-400 font-black text-xs">{formatCurrency(v.price)} <span className="text-[10px] text-white/50 lowercase">/mo</span></p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Section */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
                    <div>
                        <span className="text-primary-600 font-black uppercase tracking-[0.3em] text-[10px] block mb-3">Limited Selection</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 italic tracking-tight">Curated <span className="text-primary-600">Masterpieces</span></h2>
                    </div>
                    <Link to="/browse">
                        <Button variant="ghost" className="pl-0 md:pl-4 text-slate-400 hover:text-primary-600 font-black uppercase tracking-widest text-[10px] group transition-all">
                            View all archive <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-96 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)
                    ) : (
                        featuredListings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))
                    )}
                </div>
            </section>

            {/* Trust Section */}
            <section className="bg-slate-50 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 relative overflow-hidden group mx-4 md:mx-0">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="text-center mb-12 md:mb-20 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 italic tracking-tight">Why the industry <span className="text-primary-600">trusts</span> us?</h2>
                    <p className="text-slate-500 font-bold max-w-2xl mx-auto text-base md:text-lg leading-relaxed italic">Redefining the rental experience through transparency and technology.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 relative z-10">
                    {[
                        { title: 'Verified Identity', desc: 'Every homeowner undergoes rigorous digital identity verification for your safety.', icon: '🛡️' },
                        { title: 'Direct Pipeline', desc: 'Secure direct communication channels without unnecessary intermediaries.', icon: '🔗' },
                        { title: 'AI Matching', desc: 'Our neural matching engine finds properties aligned with your lifestyle.', icon: '🧠' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 border border-slate-50/50">
                            <div className="text-3xl md:text-4xl mb-6 md:mb-8 bg-slate-900 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 italic tracking-tight">{item.title}</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-bold italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
