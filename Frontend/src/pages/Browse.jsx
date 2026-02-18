import { useState, useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import API from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { Filter, SlidersHorizontal, Search, Check } from 'lucide-react';

const Browse = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await API.get('/listings');
                setListings(res.data);
            } catch (error) {
                console.error("Failed to fetch listings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <Button
                    variant="outline"
                    className="w-full flex justify-between items-center rounded-xl py-3"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</span>
                    <SlidersHorizontal className="w-4 h-4" />
                </Button>
            </div>

            {/* Sidebar Filters - Modernized */}
            <aside className={`lg:w-1/4 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-28">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <Filter className="w-4 h-4 mr-2" /> Filters
                        </h3>
                        <button className="text-sm text-primary-600 font-medium hover:text-primary-700">Reset</button>
                    </div>

                    <div className="space-y-6">
                        {/* Search */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Location</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="City, Street..."
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Price Range (LKR)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-slate-50"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Bedrooms</label>
                            <div className="flex gap-2 flex-wrap">
                                {['Any', '1', '2', '3', '4+'].map((beds, i) => (
                                    <button
                                        key={beds}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${i === 2 ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {beds}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Amenities</label>
                            <div className="space-y-2.5">
                                {['AC', 'Parking', 'Garden', 'Servant Quarters', 'Hot Water'].map((amenity) => (
                                    <label key={amenity} className="flex items-center group cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" className="peer h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                        </div>
                                        <span className="ml-2.5 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button className="w-full rounded-xl mt-4">Apply Filters</Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Properties for Rent</h1>
                    <span className="text-slate-500 text-sm font-medium">{listings.length} results found</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}

                {/* Pagination - Modernized */}
                <div className="mt-16 flex justify-center">
                    <nav className="inline-flex rounded-xl shadow-sm space-x-2" aria-label="Pagination">
                        <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            Previous
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-bold shadow-md shadow-primary-500/20">
                            1
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            2
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            3
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            Next
                        </button>
                    </nav>
                </div>
            </main>
        </div>
    );
};

export default Browse;
