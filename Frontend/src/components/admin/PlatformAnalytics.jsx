import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import API from '../../utils/api';

const formatGrowth = (pct) => {
    if (pct === null || pct === undefined) return 'New';
    return `${pct > 0 ? '+' : ''}${pct}%`;
};

// Admin analytics tab: demand vs supply by town and growth, computed by the API
// from the last 30 days of real activity (inquiries + viewing requests).
const PlatformAnalytics = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/admin/health-analytics')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Could not load analytics'));
    }, []);

    if (error) {
        return <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-sm">{error}</div>;
    }

    if (!data) {
        return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
    }

    const { platformPulse, heatmap, recommendations, windowDays } = data;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Demand by Town</h3>
                <p className="text-xs text-slate-500 mb-8">Inquiries and viewing requests in the last {windowDays} days, relative to the busiest town.</p>
                {heatmap.length === 0 ? (
                    <p className="text-sm text-slate-500">No activity recorded yet.</p>
                ) : (
                    <div className="space-y-6">
                        {heatmap.map((town) => (
                            <div key={town.town}>
                                <div className="flex justify-between items-center mb-2 gap-4">
                                    <span className="text-xs font-black text-slate-700">{town.town}</span>
                                    <span className="text-[10px] font-bold text-slate-400 text-right">
                                        {town.demandCount} requests · {town.supplyCount} active listings
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000"
                                        style={{ width: `${town.demandScore}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Last {windowDays} Days</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">New listings</p>
                            <p className="text-2xl font-black">{platformPulse.newListings}</p>
                            <p className="text-xs text-primary-400 font-bold">{formatGrowth(platformPulse.listingGrowthPct)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">New users</p>
                            <p className="text-2xl font-black">{platformPulse.newUsers}</p>
                            <p className="text-xs text-primary-400 font-bold">{formatGrowth(platformPulse.userGrowthPct)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Open reports per 100 live listings</p>
                        <p className="text-2xl font-black">{platformPulse.openReportRate}</p>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">Recommendations</p>
                        <ul className="space-y-4">
                            {recommendations.map((text) => (
                                <li key={text} className="text-xs flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1 shrink-0"></div>
                                    <p className="text-slate-300">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformAnalytics;
