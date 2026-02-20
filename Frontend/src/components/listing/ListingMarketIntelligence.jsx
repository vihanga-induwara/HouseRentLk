import React from 'react';
import { TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const getInvestmentRating = (insight) => {
    if (!insight) return null;
    const diff = insight.difference;
    if (diff <= -15) return { grade: 'A+', label: 'Exceptional Value', color: 'text-emerald-300' };
    if (diff <= -5) return { grade: 'A', label: 'Great Value', color: 'text-green-300' };
    if (diff <= 5) return { grade: 'B+', label: 'Fair Market Rate', color: 'text-blue-300' };
    if (diff <= 15) return { grade: 'B', label: 'Slightly Above Market', color: 'text-amber-300' };
    return { grade: 'C', label: 'Above Market Price', color: 'text-red-300' };
};

const ListingMarketIntelligence = ({ marketInsight, price, town }) => {
    if (!marketInsight) return null;

    const investmentRating = getInvestmentRating(marketInsight);

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-black mb-8 italic tracking-tight flex items-center gap-3">
                    <TrendingDown className="h-6 w-6 text-primary-400" /> Market Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Listing Price</span>
                            <span className="text-2xl font-black italic">{formatCurrency(price)}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Area Average</span>
                            <span className="text-2xl font-black italic">{formatCurrency(marketInsight.areaAverage)}</span>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <p className="text-sm font-bold text-slate-300 italic">
                                {marketInsight.difference <= -5
                                    ? `This property is priced ${Math.abs(marketInsight.difference)}% lower than similar listings in ${town}. High demand expected.`
                                    : marketInsight.difference > 10
                                        ? `This property is ${Math.abs(marketInsight.difference)}% above average for ${town}.`
                                        : 'This property is priced at a competitive market rate for the area.'}
                            </p>
                        </div>
                    </div>
                    {investmentRating && (
                        <div className="bg-primary-600/20 rounded-[2rem] p-8 border border-primary-500/30 flex flex-col justify-center">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-4">Investment Rating</h4>
                            <div className={`text-5xl font-black italic mb-2 ${investmentRating.color}`}>{investmentRating.grade}</div>
                            <p className="text-xs font-bold text-primary-200 uppercase tracking-widest">{investmentRating.label}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingMarketIntelligence;
