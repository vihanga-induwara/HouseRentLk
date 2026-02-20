import React from 'react';
import { Bed, Bath, Layout, Shield } from 'lucide-react';

const ListingStats = ({ beds, baths, size, type }) => {
    const stats = [
        { label: 'Bedrooms', value: beds, icon: Bed },
        { label: 'Bathrooms', value: baths, icon: Bath },
        { label: 'Square Ft', value: size, icon: Layout },
        { label: 'Property Type', value: type, icon: Shield },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-slate-100 dark:border-slate-800">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl mb-4">
                        <stat.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="block font-black text-slate-900 dark:text-white text-3xl italic tracking-tighter mb-1">{stat.value}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{stat.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ListingStats;
