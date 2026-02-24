import React, { useState } from 'react';
import { Wallet, Calendar, Shield, CreditCard, PieChart } from 'lucide-react';
import API from '../../utils/api';

const RentalDepositPlanner = ({ defaultRent = 50000 }) => {
    const [rent, setRent] = useState(defaultRent);
    const [months, setMonths] = useState(6);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateDeposit = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/ai/budget-plan', {
                action: 'deposit',
                rent: Number(rent),
                months: Number(months)
            });
            setResult(data);
        } catch (error) {
            console.error('Deposit calculation failed', error);
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
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                    <Wallet className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Rental Deposit <span className="text-emerald-500">Planner</span></h3>
                    <p className="text-xs font-medium text-slate-400">Total initial cost for your next home</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Rent (LKR)</label>
                    <input
                        type="number"
                        value={rent}
                        onChange={(e) => setRent(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Advance Period (Months)</label>
                    <select
                        value={months}
                        onChange={(e) => setMonths(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none"
                    >
                        <option value={3}>3 Months</option>
                        <option value={4}>4 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>1 Year</option>
                    </select>
                </div>
            </div>

            <button
                onClick={calculateDeposit}
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 mb-8"
            >
                {loading ? 'Calculating...' : 'Calculate Initial Cost'}
            </button>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 bg-slate-900 dark:bg-slate-700 rounded-[2.5rem] border border-emerald-500/20 text-center relative overflow-hidden group">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Initial Cash Needed</div>
                        <div className="text-4xl font-black italic tracking-tighter text-emerald-400">{formatLKR(result.totalInitialCost)}</div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase">Rent: {formatLKR(result.monthlyRent)}</div>
                            <div className="px-3 py-1 bg-white/5 text-white/60 rounded-full text-[9px] font-black uppercase">Moving Est: {formatLKR(result.movingEstimate)}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Advance Payment ({months}m)</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white italic">{formatLKR(result.advancePayment)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Refundable Deposit</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white italic">{formatLKR(result.refundableDeposit)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-amber-500" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Moving Budget Estimate</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white italic">{formatLKR(result.movingEstimate)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalDepositPlanner;
