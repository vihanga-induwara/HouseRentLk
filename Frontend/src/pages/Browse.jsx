import { useState } from 'react';
import ListingCard from '../components/ListingCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { Filter, SlidersHorizontal, Search, Check } from 'lucide-react';

const Browse = () => {
    // Mock data - same as before
    const allListings = [
        {
            id: 1,
            title: 'Modern House in Negombo',
            price: 45000,
            location: 'Negombo, Western Province',
            beds: 3,
            baths: 2,
            size: 1500,
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
            amenities: ['AC', 'Parking', 'Garden'],
        },
        {
            id: 2,
            title: 'Luxury Villa with Pool',
            price: 120000,
            location: 'Colombo 07, Western Province',
            beds: 4,
            baths: 4,
            size: 3200,
            image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
            amenities: ['Pool', 'AC', 'Parking', 'Servant Quarters'],
        },
        {
            id: 3,
            title: 'Cozy Family Home',
            price: 35000,
            location: 'Kandy, Central Province',
            beds: 2,
            baths: 1,
            size: 1100,
            image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
            amenities: ['Garden', 'Parking'],
        },
        {
            id: 4,
            title: 'Beachside Bungalow',
            price: 65000,
            location: 'Galle, Southern Province',
            beds: 3,
            baths: 2,
            size: 1800,
            image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
            amenities: ['Garden', 'Beach View'],
        },
        {
            id: 5,
            title: 'Apartment in Dehiwala',
            price: 55000,
            location: 'Dehiwala, Western Province',
            beds: 2,
            baths: 2,
            size: 1000,
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
            amenities: ['AC', 'Security'],
        },
        {
            id: 6,
            title: 'Spacious House in Gampaha',
            price: 40000,
            location: 'Gampaha, Western Province',
            beds: 4,
            baths: 3,
            size: 2000,
            image: 'https://images.unsplash.com/photo-1600596542815-225bf729808e',
            amenities: ['Garden', 'Parking', 'Well Water'],
        },
    ];

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
                    <span className="text-slate-500 text-sm font-medium">6 results found</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>

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
