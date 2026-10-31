import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../../utils/constants';

const ListingSimilar = ({ similarListings }) => {
    if (!Array.isArray(similarListings) || similarListings.length === 0) return null;

    return (
        <div className="pt-16 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight mb-8">
                Similar <span className="text-primary-600">Properties</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarListings.map(l => (
                    <Link key={l._id} to={`/listings/${l._id}`} className="bg-white dark:bg-slate-800 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all block group">
                        <img
                            src={l.images?.[0] || NO_IMAGE_PLACEHOLDER}
                            className="w-full h-48 object-cover rounded-[1.5rem] mb-4 group-hover:scale-[1.02] transition-transform"
                            alt={l.title}
                            loading="lazy"
                        />
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{l.title}</h3>
                        <p className="text-primary-600 font-black">{formatCurrency(l.price)}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{l.location?.town}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ListingSimilar;
