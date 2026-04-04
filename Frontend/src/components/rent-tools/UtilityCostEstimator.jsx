import React, { useState } from 'react';
import { Lightbulb, Droplets, MapPin, Building2, Sparkles, Save } from 'lucide-react';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const UtilityCostEstimator = () => {
    const { user } = useAuth();
    const [town, setTown] = useState('Colombo');
    const [type, setType] = useState('Apartment');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const estimateUtilities = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/ai/budget-plan', {
                action: 'utilities',
                town,
                type
            });
            setResult(data);
            toast.success('Utility costs estimated successfully!');
        } catch (error) {
            console.error('Utility estimation failed', error);
            toast.error(error.response?.data?.message || 'Utility estimation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await API.post('/budget-plans', {
                title: 'Utility Cost Estimate',
                calculationType: 'utilities',
                inputs: { town, type },
                results: result
            });
            toast.success('Budget plan saved to your profile!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save budget plan');
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
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Utility <span className="text-amber-500">Estimator</span></h3>
                    <p className="text-xs font-medium text-slate-400">Monthly electricity & water estimates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Location / Town</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={town}
                            onChange={(e) => setTown(e.target.value)}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Property Type</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-amber-500 outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none"
                        >
                            <option value="Apartment">Luxury Apartment</option>
                            <option value="House">Standard House</option>
                            <option value="Annex">Annex / Bed-Sitter</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={estimateUtilities}
                disabled={loading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98] disabled:opacity-50 mb-8"
            >
                {loading ? 'Estimating...' : 'Get AI Estimates'}
            </button>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 text-center">
                            <Lightbulb className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Electricity</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white italic">{formatLKR(result.electricity)}</div>
                        </div>
                        <div className="p-5 bg-cyan-50 dark:bg-cyan-900/10 rounded-[2rem] border border-cyan-100 dark:border-cyan-900/30 text-center">
                            <Droplets className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Water Bill</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white italic">{formatLKR(result.water)}</div>
                        </div>
                    </div>

                    <div className="p-5 bg-slate-900 dark:bg-slate-700 rounded-[2rem] border border-slate-800 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Estimated Monthly Utilities</div>
                        <div className="text-2xl font-black text-amber-400 italic">{formatLKR(result.total)}</div>
                    </div>

                    <p className="mt-4 text-[10px] text-center text-slate-400 font-medium italic">
                        Estimates based on average consumption for a 2-3 person household in {town}.
                    </p>

                    {user && (
                        <button
                            onClick={handleSavePlan}
                            className="w-full mt-4 py-3 border-2 border-amber-500/20 text-amber-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-amber-50 flex items-center justify-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Save This Plan to Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UtilityCostEstimator;
