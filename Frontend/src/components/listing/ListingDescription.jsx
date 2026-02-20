import React from 'react';
import { Check, Info, CheckCircle } from 'lucide-react';

const ListingDescription = ({ description, houseRules, amenities, aiDescription }) => {
    return (
        <div className="space-y-16">
            {/* AI Insights */}
            {aiDescription?.description && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic tracking-tight">
                        <CheckCircle className="h-6 w-6 text-primary-500" /> Neighborhood <span className="text-primary-600">DNA</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary-50 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                <Info className="h-48 w-48" />
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold italic text-lg relative z-10">
                                &ldquo;{aiDescription.description}&rdquo;
                            </p>
                        </div>
                        <div className="md:col-span-4 bg-primary-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                            <div className="text-[10px] font-black text-primary-200 uppercase tracking-[0.2em] mb-4">The Local Vibe</div>
                            <p className="font-black italic text-xl leading-snug">
                                {aiDescription.townVibe || 'Prime Residential Hub.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Description & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Home <span className="text-primary-600">Description</span></h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg whitespace-pre-line">{description}</p>
                    {houseRules && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                            <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">House Rules</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{houseRules}</p>
                        </div>
                    )}
                </div>
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Premium <span className="text-primary-600">Amenities</span></h2>
                    <div className="grid grid-cols-1 gap-4">
                        {(amenities ? Object.entries(amenities)
                            .filter(([, value]) => value === true || (typeof value === 'string' && value !== 'None' && value !== ''))
                            .map(([key, value]) => {
                                const formatted = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return typeof value === 'string' ? `${formatted}: ${value}` : formatted;
                            }) : []
                        ).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:translate-x-2">
                                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDescription;
