import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import ExternalListingCard from '../components/ExternalListingCard';
import API from '../utils/api';
import Button from '../components/Button';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-hot-toast';
import { Bell, Sparkles, MapPin, Layout, Filter, SlidersHorizontal, Search, AlertTriangle, ArrowUpDown, X, Loader2, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to auto-center map — only updates when center/zoom actually change
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    const [lat, lng] = center;
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [map, lat, lng, zoom]);
    return null;
};

const PROPERTY_TYPES = ['Any', 'House', 'Boarding Room', 'Annex', 'Apartment', 'Other'];
const FURNISHED_OPTIONS = ['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'];
const SORT_OPTIONS = [
    { value: '', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'views', label: 'Most Viewed' },
];

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [resultsStats, setResultsStats] = useState({ total: 0, pages: 1 });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [nlpQuery, setNlpQuery] = useState('');
    const [nlpParsing, setNlpParsing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Parse filters directly from URL params each render — single source of truth
    const getFiltersFromParams = useCallback(() => ({
        town: searchParams.get('town') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        beds: searchParams.get('beds') || '',
        type: searchParams.get('type') || 'Any',
        furnished: searchParams.get('furnished') || 'Any',
        sort: searchParams.get('sort') || '',
        ac: searchParams.get('ac') === 'true',
        parking: searchParams.get('parking') === 'true',
        wifi: searchParams.get('wifi') === 'true',
        page: Number(searchParams.get('page')) || 1,
        isUrgent: searchParams.get('isUrgent') === 'true',
        isFeatured: searchParams.get('isFeatured') === 'true',
        source: searchParams.get('source') || 'internal', // 'internal' or 'external'
    }), [searchParams]);

    const [filters, setFilters] = useState(getFiltersFromParams);

    // Sync local filter state when URL changes (e.g. coming from home search)
    useEffect(() => {
        setFilters(getFiltersFromParams());
    }, [searchParams, getFiltersFromParams]);

    const fetchListings = useCallback(async (currentFilters) => {
        setLoading(true);
        setFetchError(null);
        try {
            const params = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== '' && value !== 'Any' && value !== false && value !== 0 && key !== 'source') {
                    params.append(key, String(value));
                }
            });

            const endpoint = currentFilters.source === 'external' ? '/scraping/external-listings' : '/listings';
            const res = await API.get(`${endpoint}?${params.toString()}`);

            if (currentFilters.source === 'external') {
                setListings(res.data.listings || []);
                setResultsStats({ total: res.data.total, pages: res.data.pages });
            } else {
                setListings(res.data.data);
                setResultsStats({ total: res.data.total, pages: res.data.pages });
            }
        } catch (error) {
            console.error('Failed to fetch listings', error);
            setFetchError('Unable to load listings. Please check your connection and try again.');
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch when URL search params change — filters are read from URL
    useEffect(() => {
        fetchListings(getFiltersFromParams());
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const newParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== 'Any' && value !== false && value !== 0) {
                newParams.append(key, String(value));
            }
        });
        newParams.set('page', '1'); // Reset to page 1 on filter
        setSearchParams(newParams);
        setShowFilters(false); // close mobile sidebar
    };

    const resetFilters = () => {
        const reset = {
            town: '', minPrice: '', maxPrice: '', beds: '', type: 'Any',
            furnished: 'Any', sort: '', ac: false, parking: false, wifi: false, page: 1,
            isUrgent: false, isFeatured: false,
            source: 'internal'
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

    const handleNlpSearch = useCallback(async () => {
        if (!nlpQuery.trim() || nlpParsing) return;
        setNlpParsing(true);
        try {
            const res = await API.post('/ai/nlp-search', { query: nlpQuery.trim() });
            const parsed = res.data.parsed_filters || {};
            const newParams = new URLSearchParams();
            if (parsed.town) newParams.set('town', parsed.town);
            if (parsed.beds) newParams.set('beds', String(parsed.beds));
            if (parsed.minPrice) newParams.set('minPrice', String(parsed.minPrice));
            if (parsed.maxPrice) newParams.set('maxPrice', String(parsed.maxPrice));
            if (parsed.type) newParams.set('type', parsed.type);
            if (parsed.furnished) newParams.set('furnished', parsed.furnished);
            if (parsed.amenities?.ac) newParams.set('ac', 'true');
            if (parsed.amenities?.parking) newParams.set('parking', 'true');
            if (parsed.amenities?.wifi) newParams.set('wifi', 'true');
            newParams.set('page', '1');
            setSearchParams(newParams);
            toast.success(`Smart search applied (${res.data.confidence} confidence)`);
        } catch {
            toast.error('Smart search failed. Try regular filters.');
        } finally {
            setNlpParsing(false);
        }
    }, [nlpQuery, nlpParsing, setSearchParams]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-6 flex gap-4">
                    <Button
                        variant="outline"
                        aria-label="Toggle filters"
                        className="flex-1 flex justify-between items-center rounded-2xl py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <span className="flex items-center font-black uppercase tracking-widest text-[10px]"><Filter className="w-4 h-4 mr-2" /> Filters</span>
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                        aria-label={viewMode === 'grid' ? 'Switch to map view' : 'Switch to grid view'}
                        className="px-6 rounded-2xl bg-slate-900 text-white flex items-center gap-2 border-2 border-slate-900"
                    >
                        {viewMode === 'grid' ? <MapPin className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile overlay — close sidebar on click */}
                {showFilters && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setShowFilters(false)}
                        aria-label="Close filters"
                    />
                )}

                {/* Sidebar Filters */}
                <aside className={`lg:w-[320px] space-y-8 ${showFilters ? 'fixed inset-y-0 left-0 z-40 w-[90vw] max-w-[340px] overflow-y-auto bg-white dark:bg-slate-900 p-4' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 sticky top-28 overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600"></div>

                        {/* Mobile close button */}
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                <Filter className="w-3.5 h-3.5 mr-2 text-primary-500" /> Discover Space
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                                >
                                    Reset All
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                    aria-label="Close filters"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Town Search */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Destination Town</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Region or town..."
                                        value={filters.town}
                                        onChange={(e) => handleFilterChange('town', e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 text-sm font-bold border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:border-primary-500 bg-slate-50/50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all outline-none dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Property Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PROPERTY_TYPES.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => handleFilterChange('type', t)}
                                            className={`py-2.5 px-3 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all ${filters.type === t ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/20' : 'border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:border-slate-300'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Budget Range (LKR)</label>
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Minimum Rent"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:border-primary-500 bg-slate-50/50 dark:bg-slate-900 outline-none dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Maximum Rent"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:border-primary-500 bg-slate-50/50 dark:bg-slate-900 outline-none dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Preferred Bedrooms</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Any', '1', '2', '3', '4+'].map((beds) => (
                                        <button
                                            key={beds}
                                            onClick={() => handleFilterChange('beds', beds === 'Any' ? '' : beds)}
                                            className={`py-3 px-4 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all ${(filters.beds === beds || (beds === 'Any' && !filters.beds)) ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/20' : 'border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:border-slate-200'}`}
                                        >
                                            {beds}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Furnished */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Furnished Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FURNISHED_OPTIONS.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => handleFilterChange('furnished', f)}
                                            className={`py-2.5 px-3 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all ${filters.furnished === f ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/20' : 'border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:border-slate-300'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Amenities</label>
                                <div className="space-y-3">
                                    {[
                                        { key: 'ac', label: 'Air Conditioning' },
                                        { key: 'parking', label: 'Parking Space' },
                                        { key: 'wifi', label: 'WiFi / Internet' }
                                    ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => handleFilterChange(key, !filters[key])}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${filters[key] ? 'bg-primary-600 border-primary-600' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'}`}
                                        >
                                            {filters[key] && <span className="text-white text-xs font-black">✓</span>}
                                        </div>
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{label}</span>
                                    </label>
                                    ))}

                                    <div className="pt-4 space-y-3 border-t border-slate-100 dark:border-slate-700">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => handleFilterChange('isUrgent', !filters.isUrgent)}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${filters.isUrgent ? 'bg-red-600 border-red-600' : 'border-slate-200 dark:border-slate-600 hover:border-red-300'}`}
                                            >
                                                {filters.isUrgent && <span className="text-white text-xs font-black">✓</span>}
                                            </div>
                                            <span className="text-xs font-black text-red-600 uppercase tracking-widest">Urgent Ads Only</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => handleFilterChange('isFeatured', !filters.isFeatured)}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${filters.isFeatured ? 'bg-amber-600 border-amber-600' : 'border-slate-200 dark:border-slate-600 hover:border-amber-300'}`}
                                            >
                                                {filters.isFeatured && <span className="text-white text-xs font-black">✓</span>}
                                            </div>
                                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Featured Only</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={applyFilters} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 active:scale-95">Apply Filters</Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-2">Available <span className="text-primary-600">Inventory</span></h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{resultsStats.total} Properties discovered</span>
                                <button
                                    onClick={handleSaveSearch}
                                    className="flex items-center gap-2 text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-full border border-primary-100 transition-all w-fit"
                                    aria-label="Save this search"
                                >
                                    <Bell className="h-3 w-3" /> Save this Search
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        handleFilterChange('source', 'internal');
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.set('source', 'internal');
                                        newParams.set('page', '1');
                                        setSearchParams(newParams);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filters.source !== 'external'
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    Local Listings
                                </button>
                                <button
                                    onClick={() => {
                                        handleFilterChange('source', 'external');
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.set('source', 'external');
                                        newParams.set('page', '1');
                                        setSearchParams(newParams);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filters.source === 'external'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    External (Beta)
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                            {/* Sort Dropdown */}
                            <div className="relative flex-1 md:flex-none">
                                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <select
                                    value={filters.sort}
                                    onChange={(e) => {
                                        handleFilterChange('sort', e.target.value);
                                        const newParams = new URLSearchParams(searchParams);
                                        if (e.target.value) newParams.set('sort', e.target.value);
                                        else newParams.delete('sort');
                                        newParams.set('page', '1');
                                        setSearchParams(newParams);
                                    }}
                                    aria-label="Sort listings"
                                    className="w-full md:w-auto pl-8 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 focus:border-primary-500 outline-none appearance-none cursor-pointer"
                                >
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>

                            {/* Desktop View Switcher */}
                            <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <Layout className="w-3.5 h-3.5" /> Gallery Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    aria-label="Map view"
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <MapPin className="w-3.5 h-3.5" /> Interactive Map
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Smart Search Bar */}
                    <div className="mb-8 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 p-4 md:p-5 rounded-[2rem] md:rounded-3xl border border-violet-100 dark:border-violet-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-violet-600" />
                            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">AI Smart Search</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                                <input
                                    type="text"
                                    value={nlpQuery}
                                    onChange={(e) => setNlpQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNlpSearch()}
                                    placeholder='Try: "2 bed house in Kandy under 30k"'
                                    className="w-full pl-11 pr-4 py-4 text-sm font-bold rounded-2xl border-2 border-violet-100 dark:border-violet-700 bg-white dark:bg-slate-800 focus:border-violet-400 outline-none dark:text-white transition-all"
                                />
                            </div>
                            <button
                                onClick={handleNlpSearch}
                                disabled={nlpParsing || !nlpQuery.trim()}
                                className="w-full md:w-auto justify-center px-6 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-xl shadow-violet-500/20"
                            >
                                {nlpParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                {nlpParsing ? 'Parsing...' : 'Search'}
                            </button>
                        </div>
                        <p className="hidden md:block text-[10px] text-violet-400 mt-2 font-bold">Describe what you're looking for in plain language — our AI will find it.</p>
                    </div>

                    {/* Error state */}
                    {
                        fetchError && !loading && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-[3rem] p-16 text-center mb-8">
                                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-2 italic">Could Not Load Listings</h3>
                                <p className="text-red-500 dark:text-red-300 font-bold mb-6 text-sm">{fetchError}</p>
                                <Button onClick={() => fetchListings(filters)} variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-red-200 text-red-600 hover:bg-red-50">
                                    Try Again
                                </Button>
                            </div>
                        )
                    }

                    {
                        loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] animate-pulse border-2 border-slate-100 dark:border-slate-700"></div>)}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <>
                                {listings.length === 0 && !fetchError ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <Search className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight">Zero Matches Found</h3>
                                        <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 italic">We couldn&apos;t find any properties matching your exact criteria. Try broadening your search.</p>
                                        <Button onClick={resetFilters} variant="outline" className="rounded-2xl px-10 py-4 font-black uppercase tracking-widest text-[10px] border-2 border-slate-200">Clear Filters</Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                        {listings.map((listing) => (
                                            filters.source === 'external' ? (
                                                <ExternalListingCard key={listing._id} listing={listing} />
                                            ) : (
                                                <ListingCard key={listing._id} listing={listing} />
                                            )
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Interactive Map */
                            <div className="relative h-[500px] md:h-[750px] bg-slate-100 dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white dark:border-slate-700 z-0">
                                <MapContainer
                                    center={[7.8731, 80.7718]}
                                    zoom={8}
                                    scrollWheelZoom={true}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <ChangeView
                                        center={filters.town && listings.length > 0 && listings[0].location?.coordinates?.coordinates
                                            ? [listings[0].location.coordinates.coordinates[1], listings[0].location.coordinates.coordinates[0]]
                                            : [7.8731, 80.7718]}
                                        zoom={filters.town ? 12 : 8}
                                    />
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {listings.map((l) => (
                                        l.location && l.location.coordinates && l.location.coordinates.coordinates?.length === 2 && (
                                            <Marker
                                                key={l._id}
                                                position={[
                                                    l.location.coordinates.coordinates[1], // lat
                                                    l.location.coordinates.coordinates[0]  // lng
                                                ]}
                                            >
                                                <Popup className="custom-popup">
                                                    <div className="w-48">
                                                        <img src={l.images?.[0]} className="w-full h-24 object-cover rounded-lg mb-2" alt={l.title} loading="lazy" />
                                                        <h3 className="font-bold text-sm truncate">{l.title}</h3>
                                                        <p className="text-primary-600 font-bold text-xs">{formatCurrency(l.price)}</p>
                                                        {/* Use React Link via navigate – Popup renders outside React tree so we use a plain anchor with full reload prevention */}
                                                        <Link to={`/listings/${l._id}`} className="block mt-2 text-center text-[10px] bg-slate-900 text-white py-1 rounded hover:bg-primary-600 transition-colors">View Details</Link>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )
                                    ))}
                                </MapContainer>

                                {/* Map UI Overlays */}
                                <div className="absolute top-4 left-4 z-[400] flex flex-col gap-4 pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] shadow-xl max-w-xs border border-white/50 pointer-events-auto">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 text-primary-500" /> Live View
                                        </h4>
                                        <p className="text-slate-900 font-bold italic text-sm leading-snug">
                                            {listings.length} properties found in this area.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Pagination */}
                    {
                        !loading && !fetchError && resultsStats.pages > 1 && (
                            <div className="mt-20 flex justify-center">
                                <nav className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 gap-2" aria-label="Pagination">
                                    {[...Array(resultsStats.pages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.set('page', String(i + 1));
                                                setSearchParams(newParams);
                                                setFilters(prev => ({ ...prev, page: i + 1 }));
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            aria-label={`Page ${i + 1}`}
                                            aria-current={Number(filters.page) === i + 1 ? 'page' : undefined}
                                            className={`w-12 h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all ${Number(filters.page) === i + 1 ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )
                    }
                </main >
            </div >
        </div >
    );
};

export default Browse;
