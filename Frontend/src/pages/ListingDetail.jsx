import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Layout, Share2, Heart, Shield, Check, Phone, Mail, ArrowLeft, Calendar } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const ListingDetail = () => {
    const { id } = useParams();

    // Mock data
    const listing = {
        id,
        title: 'Modern House in Negombo',
        price: 45000,
        address: '123 Beach Road, Negombo, Western Province',
        description: `
      Beautiful newly built house located in a quiet residential area in Negombo. 
      Walking distance to the beach and main road. Close to supermarkets, schools, and banks.
      
      The house features a spacious living room, modern kitchen with pantry cupboards, and a landscaped garden.
      Perfect for a small family or couple looking for a peaceful stay.
      
      Minimum lease term: 1 year.
      Advance payment: 6 months.
    `,
        beds: 3,
        baths: 2,
        size: 1500,
        type: 'House',
        status: 'For Rent',
        images: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        ],
        amenities: ['Air Conditioning', 'Hot Water', 'Parking', 'Garden', 'Servant Toilet', 'Wall & Gate', 'Overhead Tank'],
        owner: {
            name: 'Sunil Perera',
            type: 'Owner',
            verified: true,
            joined: 'January 2024'
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb & Navigation */}
            <div className="flex justify-between items-center mb-6">
                <Link to="/browse" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Listings
                </Link>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors text-sm font-medium">
                        <Heart className="h-4 w-4" /> Save
                    </button>
                </div>
            </div>

            {/* Gallery Grid - Modern Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden shadow-sm h-[400px] md:h-[500px] mb-10">
                <div className="h-full relative group">
                    <img
                        src={listing.images[0]}
                        alt="Main View"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 h-full">
                    {listing.images.slice(1).map((img, idx) => (
                        <div key={idx} className="h-full relative overflow-hidden group">
                            <img
                                src={img}
                                alt="Interior"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {idx === 1 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                    <span className="text-white font-bold text-lg">+ 5 photos</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Header Info */}
                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                                <div className="flex items-center text-slate-500 font-medium">
                                    <MapPin className="h-5 w-5 mr-2 text-primary-500" />
                                    {listing.address}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary-600">
                                    LKR {listing.price.toLocaleString()}
                                </div>
                                <div className="text-slate-500 text-sm font-medium">per month</div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 py-6 border-y border-slate-100">
                            {[
                                { label: 'Bedrooms', value: listing.beds, icon: Bed },
                                { label: 'Bathrooms', value: listing.baths, icon: Bath },
                                { label: 'Square Ft', value: listing.size, icon: Layout },
                                { label: 'Property Type', value: listing.type, icon: Shield },
                            ].map((stat, i) => (
                                <div key={i} className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                    <stat.icon className="h-6 w-6 text-primary-500 mb-2" />
                                    <span className="block font-bold text-slate-900 text-lg">{stat.value}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About this home</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {listing.description}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                            {listing.amenities.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="h-6 w-6 rounded-full bg-secondary-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3.5 w-3.5 text-secondary-600" />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location Map Placeholder */}
                    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                        <div className="bg-slate-100 h-80 flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <span className="font-semibold">Map View Integration</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-28">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl border-2 border-white shadow-md">
                                {listing.owner.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{listing.owner.name}</p>
                                <div className="flex items-center text-sm font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {listing.owner.verified ? 'Verified Owner' : 'Owner'}
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <Input placeholder="Your Name" className="bg-slate-50" />
                            <Input placeholder="Email Address" type="email" className="bg-slate-50" />
                            <Input placeholder="Phone (Optional)" className="bg-slate-50" />
                            <textarea
                                className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-3 border h-32 bg-slate-50 text-slate-800 placeholder:text-slate-400 resize-none"
                                placeholder="I am interested in this property..."
                                defaultValue={`Hi, I'm interested in "${listing.title}".`}
                            ></textarea>
                            <Button className="w-full py-3.5 text-lg font-bold shadow-lg shadow-primary-500/30 rounded-xl">
                                Send Message
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <Button variant="outline" className="w-full gap-2 rounded-xl py-3 border-slate-200">
                                <Phone className="h-4 w-4" />
                                Show Phone Number
                            </Button>
                            <p className="text-xs text-slate-400 mt-4 text-center">
                                By sending a message, you agree to our Terms of Use and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
