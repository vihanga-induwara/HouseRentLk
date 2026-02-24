import React, { useState } from 'react';
import { Home, Repeat, Info, ChevronRight } from 'lucide-react';
import API from '../../utils/api';

const RentVsBuyComparison = () => {
    const [rent, setRent] = useState(60000);
    const [value, setValue] = useState(15000000);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const compareRentVsBuy = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/ai/budget-plan', {
                action: 'rent_vs_buy',
                rent: Number(rent),
                value: Number(value)
            });
            setResult(data);
        } catch (error) {
            console.error('Comparison failed', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLKR = (val) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                    <Repeat className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Rent vs <span className="text-indigo-500">Buy</span></h3>
                    <p className="text-xs font-medium text-slate-400">Decide which is better for your future</p>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Rent (LKR)</label>
                    <input
                        type="number"
                        value={rent}
                        onChange={(e) => setRent(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Property Value (LKR)</label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                </div>

                <button
                    onClick={compareRentVsBuy}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Compare Options'}
                </button>
            </div>

            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Rent</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white italic">{formatLKR(result.monthlyRent)}</div>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Mortgage</div>
                            <div className="text-xl font-black text-indigo-500 italic">{formatLKR(result.monthlyMortgage)}</div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 dark:bg-slate-700 rounded-[2rem] relative overflow-hidden group border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">10-Year Cost Analysis</div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.recommendation === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                Recommend: {result.recommendation}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                                    <span>Total Rent</span>
                                    <span>{formatLKR(result.rentTotal10Yr)}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                                    <span>Total Buy (Mortgage)</span>
                                    <span>{formatLKR(result.buyTotal10Yr)}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 italic">
                            <Info className="h-3 w-3" />
                            <span>Analysis considers 14.5% interest and 80% LTV loan.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentVsBuyComparison;
