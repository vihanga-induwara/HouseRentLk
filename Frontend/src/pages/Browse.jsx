import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import API from '../utils/api';
import Button from '../components/Button';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-hot-toast';
import { Bell, Sparkles, MapPin } from 'lucide-react';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultsStats, setResultsStats] = useState({ total: 0, pages: 1 });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

    // Filter states
    const [filters, setFilters] = useState({
        town: searchParams.get('town') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        beds: searchParams.get('beds') || '',
        type: searchParams.get('type') || 'Any',
        ac: searchParams.get('ac') === 'true',
        parking: searchParams.get('parking') === 'true',
        wifi: searchParams.get('wifi') === 'true',
        page: searchParams.get('page') || 1
    });

    const fetchListings = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value && value !== 'Any') params.append(key, value);
            });

            const res = await API.get(`/listings?${params.toString()}`);
            setListings(res.data.data);
            setResultsStats({ total: res.data.total, pages: res.data.pages });
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings(filters);
    }, [searchParams]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const newParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'Any') newParams.append(key, value);
        });
        newParams.set('page', 1); // Reset to page 1 on filter
        setSearchParams(newParams);
    };

    const resetFilters = () => {
        const reset = {
            town: '', minPrice: '', maxPrice: '', beds: '', type: 'Any',
            ac: false, parking: false, wifi: false, page: 1
        };
        setFilters(reset);
        setSearchParams({});
    };

    const handleSaveSearch = async () => {
        try {
            const searchData = {
                name: filters.town ? `Search in ${filters.town}` : 'General Rental Search',
                filters: filters
            };
            await API.post('/saved-searches', searchData);
            toast.success('Search alert saved! We will notify you of new matches.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save search');
        }
    };

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-6 flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 flex justify-between items-center rounded-2xl py-4 bg-white border-2 border-slate-100"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <span className="flex items-center font-black uppercase tracking-widest text-[10px]"><Filter className="w-4 h-4 mr-2" /> Filters</span>
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                        className="px-6 rounded-2xl bg-slate-900 text-white flex items-center gap-2 border-2 border-slate-900"
                    >
                        {viewMode === 'grid' ? <MapPin className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                    </button>
                </div>

                {/* Sidebar Filters - Ultra Premium */}
                <aside className={`lg:w-[320px] space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-28 overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600"></div>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                <Filter className="w-3.5 h-3.5 mr-2 text-primary-500" /> Discover Space
                            </h3>
                            <button
                                onClick={resetFilters}
                                className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="space-y-10">
                            {/* Search */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Destination Town</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Region or town..."
                                        value={filters.town}
                                        onChange={(e) => handleFilterChange('town', e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 text-sm font-bold border-2 border-slate-50 rounded-2xl focus:border-primary-500 bg-slate-50/50 hover:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Price Range Premium */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Budget Range (LKR)</label>
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Minimum Rent"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-50 rounded-2xl focus:border-primary-500 bg-slate-50/50 outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Maximum Rent"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-50 rounded-2xl focus:border-primary-500 bg-slate-50/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Bedrooms Toggle */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Preferred Bedrooms</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Any', '1', '2', '3', '4+'].map((beds) => (
                                        <button
                                            key={beds}
                                            onClick={() => handleFilterChange('beds', beds)}
                                            className={`py-3 px-4 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all ${filters.beds === beds || (beds === 'Any' && !filters.beds) ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/20' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            {beds}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={applyFilters} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 active:scale-95">Filter Listings</Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-2">Available <span className="text-primary-600">Inventory</span></h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{resultsStats.total} Premium spaces discovered</span>
                                <div className="hidden md:block h-1 w-20 bg-primary-100 rounded-full">
                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (resultsStats.total / 100) * 100)}%` }}></div>
                                </div>
                                <button
                                    onClick={handleSaveSearch}
                                    className="flex items-center gap-2 text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100 transition-all w-fit"
                                >
                                    <Bell className="h-3 w-3" /> Save this Search
                                </button>
                            </div>
                        </div>

                        {/* Desktop View Switcher */}
                        <div className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Layout className="w-3.5 h-3.5" /> Gallery Grid
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <MapPin className="w-3.5 h-3.5" /> Interactive Map
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-slate-50 rounded-[2.5rem] animate-pulse border-2 border-slate-100"></div>)}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <>
                            {listings.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Search className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 italic tracking-tight">Zero Matches Found</h3>
                                    <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 italic">We couldn't find any premium properties matching your exact criteria. Try broadening your horizon.</p>
                                    <Button onClick={resetFilters} variant="outline" className="rounded-2xl px-10 py-4 font-black uppercase tracking-widest text-[10px] border-2 border-slate-200">Clear Search Parameters</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {listings.map((listing) => (
                                        <ListingCard key={listing._id} listing={listing} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Interactive Map Mockup */
                        <div className="relative h-[750px] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl group border-8 border-white/5">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/79.86,6.92,12,0/1200x800?access_token=mock_token')] bg-cover bg-center mix-blend-overlay opacity-40"></div>

                            {/* Static Map Elements Mockup */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white/20 font-black text-8xl italic tracking-tighter uppercase select-none">Live Map Engine</span>
                            </div>

                            {/* Markers */}
                            {listings.map((l, i) => (
                                <div
                                    key={l._id}
                                    style={{
                                        top: `${20 + (i * 15) % 60}%`,
                                        left: `${15 + (i * 25) % 70}%`
                                    }}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker"
                                >
                                    <div className="bg-primary-600 text-white px-3 py-1.5 rounded-full font-black text-[10px] shadow-2xl ring-2 ring-white/20 group-hover/marker:scale-125 transition-all">
                                        {formatCurrency(l.price).split('.')[0]}
                                    </div>
                                    <div className="absolute top-10 left-10 w-64 bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl opacity-0 group-hover/marker:opacity-100 transition-all pointer-events-none z-50 ring-1 ring-slate-100">
                                        <img src={l.images[0]} className="w-full h-32 object-cover rounded-2xl mb-4" />
                                        <p className="font-black text-slate-900 text-xs truncate italic">{l.title}</p>
                                        <p className="text-primary-600 font-black text-[10px] uppercase mt-1 tracking-widest">{l.location.town}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Map UI Overlays */}
                            <div className="absolute top-8 left-8 flex flex-col gap-4">
                                <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl max-w-xs border border-white/20">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-primary-500" /> Neighborhood Lens
                                    </h4>
                                    <p className="text-slate-900 font-black italic text-lg leading-snug">Viewing properties across {filters.town || "Greater Colombo"}</p>
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">High Safety Rating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination - Premium */}
                    {!loading && resultsStats.pages > 1 && (
                        <div className="mt-20 flex justify-center">
                            <nav className="flex bg-white p-2 rounded-2xl shadow-xl border border-slate-100 gap-2">
                                {[...Array(resultsStats.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set('page', i + 1);
                                            setSearchParams(newParams);
                                            setFilters(prev => ({ ...prev, page: i + 1 }));
                                        }}
                                        className={`w-12 h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all ${Number(filters.page) === i + 1 ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Browse;
