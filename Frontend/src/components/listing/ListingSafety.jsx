import React from 'react';
import { Shield } from 'lucide-react';

const ListingSafety = ({ areaSafety }) => {
    if (!areaSafety) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black dark:text-white italic tracking-tight flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary-500" /> Area Safety Score
                </h3>
                <div className={`text-3xl font-black italic ${areaSafety.color === 'green' ? 'text-emerald-500' : areaSafety.color === 'blue' ? 'text-blue-500' : areaSafety.color === 'yellow' ? 'text-amber-500' : 'text-orange-500'}`}>
                    {areaSafety.overallScore}/100
                </div>
            </div>
            <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${areaSafety.color === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : areaSafety.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : areaSafety.color === 'yellow' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                }`}>
                {areaSafety.label}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {areaSafety.categories?.map((cat, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${cat.score >= 70 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-red-400'
                                    }`}
                                style={{ width: `${cat.score}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-black text-slate-500 mt-1 block">{cat.score}/100</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 font-bold italic">
                Based on {areaSafety.basedOn?.reviewsAnalyzed || 0} reviews and area data for {areaSafety.basedOn?.town}.
            </p>
        </div>
    );
};

export default ListingSafety;
