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
            } catch (error) {
                console.error("Failed to fetch featured listings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();

        // Load recently viewed from localStorage
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setRecentlyViewed(viewed.slice(0, 4));
        } catch (e) { }
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
        <div className="space-y-32 pb-20">
            {/* Hero Section - Ultra Premium */}
            <section className="relative rounded-[3rem] overflow-hidden py-24 md:py-32 bg-slate-900 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>

                <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md border border-primary-500/30">
                        <MapPin className="h-4 w-4" /> Leading Platform in Sri Lanka
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] italic tracking-tighter">
                        Find your <span className="text-primary-500">dream</span> <br /> space with AI.
                    </h1>
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Verified property connections, direct owner interaction, and intelligent neighborhood insights. Start your next chapter today.
                    </p>

                    {/* Search Bar - Premium Floating */}
                    <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-[2.5rem] shadow-2xl max-w-4xl mx-auto border border-white/10 flex flex-col md:flex-row gap-2 ring-1 ring-white/20">
                        <div className="flex-1 relative group">
                            <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Where do you want to live?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white/5 border-none focus:outline-none focus:bg-white/10 text-white placeholder-slate-400 font-bold transition-all text-lg"
                            />
                        </div>
                        <div className="hidden md:block w-px bg-white/10 my-4"></div>
                        <div className="w-full md:w-56 relative">
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-6 py-5 rounded-[2rem] bg-transparent border-none focus:outline-none focus:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer appearance-none transition-all"
                            >
                                <option value="" className="text-slate-900">Price Range</option>
                                <option value="0-50000" className="text-slate-900">Under 50k</option>
                                <option value="50000-100000" className="text-slate-900">50k - 100k</option>
                                <option value="100000-+" className="text-slate-900">100k+</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleSearch}
                            className="rounded-[2rem] px-12 py-5 text-sm font-black uppercase tracking-widest shadow-2xl bg-primary-600 hover:bg-primary-500 transition-all border-none ring-4 ring-primary-600/20"
                        >
                            Explore
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recently Viewed Component */}
            {recentlyViewed.length > 0 && (
                <section className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-10">
                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Pick up where you <span className="text-primary-600">left off</span></h2>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {recentlyViewed.map((v) => (
                            <Link key={v.id} to={`/listings/${v.id}`} className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-xl hover:translate-y-[-4px] transition-all duration-500">
                                <img src={v.image || NO_IMAGE_PLACEHOLDER} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-primary-600 font-black uppercase tracking-[0.3em] text-[10px] block mb-3">Limited Selection</span>
                        <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">Curated <span className="text-primary-600">Masterpieces</span></h2>
                    </div>
                    <Link to="/browse">
                        <Button variant="ghost" className="text-slate-400 hover:text-primary-600 font-black uppercase tracking-widest text-[10px] group transition-all">
                            View all archive <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
            <section className="bg-slate-50 rounded-[4rem] p-16 md:p-24 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="text-center mb-20 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 italic tracking-tight">Why the industry <span className="text-primary-600">trusts</span> us?</h2>
                    <p className="text-slate-500 font-bold max-w-2xl mx-auto text-lg leading-relaxed italic">Redefining the rental experience through transparency and technology.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    {[
                        { title: 'Verified Identity', desc: 'Every homeowner undergoes rigorous digital identity verification for your safety.', icon: '🛡️' },
                        { title: 'Direct Pipeline', desc: 'Secure direct communication channels without unnecessary intermediaries.', icon: '🔗' },
                        { title: 'AI Matching', desc: 'Our neural matching engine finds properties aligned with your lifestyle.', icon: '🧠' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 border border-slate-50/50">
                            <div className="text-4xl mb-8 bg-slate-900 w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 italic tracking-tight">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-bold italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
