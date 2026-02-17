import { MapPin, Bed, Bath, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing }) => {
    const { id, title, price, location, beds, baths, size, image } = listing;

    return (
        <Link to={`/listings/${id}`} className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-900 font-bold text-sm shadow-sm">
                        LKR {price.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/mo</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-primary-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                        New
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">{title}</h3>

                    <div className="flex items-center text-slate-500 text-sm mb-6">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-primary-500" />
                        <span className="truncate">{location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{beds}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{baths}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Layout className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{size}</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">Sqft</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
