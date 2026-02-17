import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import ListingCard from '../components/ListingCard';

const Home = () => {
    const featuredListings = [
        {
            id: 1,
            title: 'Modern House in Negombo',
            price: 45000,
            location: 'Negombo, Western Province',
            beds: 3,
            baths: 2,
            size: 1500,
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        },
        {
            id: 2,
            title: 'Luxury Villa with Pool',
            price: 120000,
            location: 'Colombo 07, Western Province',
            beds: 4,
            baths: 4,
            size: 3200,
            image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        },
        {
            id: 3,
            title: 'Cozy Family Home',
            price: 35000,
            location: 'Kandy, Central Province',
            beds: 2,
            baths: 1,
            size: 1100,
            image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
        },
    ];

    return (
        <div className="space-y-24">
            {/* Hero Section - Clean & Modern */}
            <section className="relative rounded-3xl overflow-hidden py-16 md:py-24 bg-primary-50">
                <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
                        #1 Rental Platform in Sri Lanka
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                        Find your perfect <span className="text-primary-600">home</span> <br /> without the hassle.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Browse verified listings, connect with owners directly, and rent with confidence. No hidden fees.
                    </p>

                    {/* Search Bar - Floating Style */}
                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-primary-500/10 max-w-3xl mx-auto border border-slate-100 flex flex-col md:flex-row gap-2">
                        <div className="flex-1 relative group">
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by city (e.g. Negombo)"
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none focus:outline-none focus:bg-slate-50 text-slate-900 placeholder-slate-400 font-medium transition-colors"
                            />
                        </div>
                        <div className="h-px md:h-auto md:w-px bg-slate-100 my-2 md:my-0"></div>
                        <div className="w-full md:w-48 relative group">
                            <select className="w-full px-4 py-3.5 rounded-xl border-none focus:outline-none focus:bg-slate-50 text-slate-700 font-medium cursor-pointer appearance-none transition-colors">
                                <option value="">Price Range</option>
                                <option value="0-50000">Under 50k</option>
                                <option value="50000-100000">50k - 100k</option>
                                <option value="100000+">100k+</option>
                            </select>
                        </div>
                        <Button size="lg" className="rounded-xl px-8 py-3.5 text-base shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40">
                            Search
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Listings</h2>
                        <p className="text-slate-500">Curated properties just for you.</p>
                    </div>
                    <Link to="/browse">
                        <Button variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 group">
                            View all listings <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </section>

            {/* Value Proposition - Minimal Cards */}
            <section className="bg-slate-50 rounded-3xl p-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Why HouseRentLk?</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">We prioritize safety and simplicity in every step of your rental journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'Verified Owners', desc: 'Every listing is checked manually.', icon: '🛡️' },
                        { title: 'Direct Contact', desc: 'No middlemen. Talk to landlords.', icon: '📞' },
                        { title: 'Local Insights', desc: 'Know the neighborhood before you move.', icon: '📍' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4 bg-primary-50 w-16 h-16 flex items-center justify-center rounded-2xl">{item.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
