import { useState } from 'react';
import { Calculator, Zap, AlertCircle, TrendingUp, Save } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const RentAffordabilityCalculator = () => {
    const { user } = useAuth();
    const [income, setIncome] = useState(150000);
    const [expenses, setExpenses] = useState(50000);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateAffordability = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/ai/budget-plan', {
                action: 'affordability',
                income: Number(income),
                expenses: Number(expenses)
            });
            setResult(data);
        } catch (error) {
            console.error('Affordability calculation failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await API.post('/user/budget-plans', {
                type: 'affordability',
                income,
                expenses,
                result
            });
            toast.success('Budget plan saved to your profile!');
        } catch (error) {
            toast.error('Failed to save budget plan');
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
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl">
                    <Calculator className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Rent Affordability <span className="text-primary-500">Calculator</span></h3>
                    <p className="text-xs font-medium text-slate-400">Find a home you can comfortably afford</p>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Income (LKR)</label>
                    <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        placeholder="e.g. 150,000"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Other Monthly Expenses (LKR)</label>
                    <input
                        type="number"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        placeholder="e.g. 50,000"
                    />
                </div>

                <button
                    onClick={calculateAffordability}
                    disabled={loading}
                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Calculating...' : 'Calculate Budget'}
                </button>
            </div>

            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-slate-900 dark:bg-slate-700 rounded-[2rem] text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Recommended Rent (30%)</div>
                        <div className="text-4xl font-black italic tracking-tighter text-primary-400">{formatLKR(result.recommendedRent)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Max Safe Limit (40%)</div>
                            <div className="text-lg font-black text-slate-900 dark:text-white italic">{formatLKR(result.maxSafeLimit)}</div>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Remaining Balance</div>
                            <div className={`text-lg font-black italic ${result.remainingAfterExpenses > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {formatLKR(result.remainingAfterExpenses)}
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${result.remainingAfterExpenses > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100'}`}>
                        {result.remainingAfterExpenses > 0 ? (
                            <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        )}
                        <p className={`text-[11px] font-bold ${result.remainingAfterExpenses > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'} italic`}>
                            {result.remainingAfterExpenses > 0
                                ? "This budget is healthy! You'll have enough for savings."
                                : "This budget might be tight. Consider reducing other expenses."}
                        </p>
                    </div>

                    {user && (
                        <button
                            onClick={handleSavePlan}
                            className="w-full py-3 border-2 border-primary-500/20 text-primary-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-primary-50 flex items-center justify-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Save This Plan to Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RentAffordabilityCalculator;
