import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, MapPin, Loader2, ArrowLeft, RefreshCw,
    BarChart3, AlertTriangle, Zap, Target, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminMarketReport = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [marketReport, setMarketReport] = useState(null);
    const [priceComparison, setPriceComparison] = useState(null);
    const [hotAreas, setHotAreas] = useState(null);
    const [dataQuality, setDataQuality] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reportRes, priceRes, hotRes, qualityRes] = await Promise.all([
                API.get('/scraping/admin/market-report').catch(() => ({ data: null })),
                API.get('/scraping/admin/price-comparison').catch(() => ({ data: null })),
                API.get('/scraping/admin/hot-areas').catch(() => ({ data: null })),
                API.get('/scraping/admin/data-quality').catch(() => ({ data: null })),
            ]);
            setMarketReport(reportRes.data);
            setPriceComparison(priceRes.data);
            setHotAreas(hotRes.data);
            setDataQuality(qualityRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load market data');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
        { key: 'prices', label: 'Price Comparison', icon: <TrendingUp className="h-4 w-4" /> },
        { key: 'hotareas', label: 'Hot Areas', icon: <Zap className="h-4 w-4" /> },
        { key: 'quality', label: 'Data Quality', icon: <Target className="h-4 w-4" /> },
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/scraping')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">📊 Market Intelligence</h1>
                        <p className="text-slate-500 mt-1">Competitor analysis and market insights</p>
                    </div>
                </div>
                <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8">
                <nav className="flex space-x-6">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.key
                                ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {marketReport ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                                    <h3 className="text-sm font-medium text-blue-100 mb-2">Total External Listings</h3>
                                    <p className="text-3xl font-bold">{marketReport.totalExternal?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                                    <h3 className="text-sm font-medium text-green-100 mb-2">Avg External Price</h3>
                                    <p className="text-3xl font-bold">LKR {(marketReport.avgExternalPrice || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                                    <h3 className="text-sm font-medium text-purple-100 mb-2">Local Listings</h3>
                                    <p className="text-3xl font-bold">{marketReport.totalLocal?.toLocaleString() || 0}</p>
                                </div>
                            </div>

                            {/* Gap Opportunities */}
                            {marketReport.gapOpportunities?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary-600" /> Gap Opportunities
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {marketReport.gapOpportunities.map((gap, i) => (
                                            <div key={i} className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-slate-900">{gap.area || gap.town}</span>
                                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                                                        {gap.externalCount} external vs {gap.localCount} local
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">{gap.insight || 'Potential growth area'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Insights */}
                            {marketReport.insights?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Insights</h3>
                                    <div className="space-y-3">
                                        {marketReport.insights.map((insight, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-slate-700">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState title="No Market Data" description="Market reports will appear here after scraping data." />
                    )}
                </div>
            )}

            {/* Price Comparison Tab */}
            {activeTab === 'prices' && (
                <div className="space-y-6">
                    {priceComparison?.comparisons?.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-semibold text-slate-900">Price Comparison by Location</h3>
                                <p className="text-sm text-slate-500 mt-1">External vs HouseRentLk listings</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">External Avg</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Local Avg</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Diff</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {priceComparison.comparisons.map((c, i) => {
                                            const diff = ((c.externalAvg - c.localAvg) / c.localAvg * 100) || 0;
                                            return (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-400" /> {c.location}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right">LKR {c.externalAvg?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-right">LKR {c.localAvg?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        <span className={`flex items-center justify-end gap-1 font-medium ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                            {Math.abs(diff).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-slate-500">{c.count}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <EmptyState title="No Price Data" description="Price comparisons appear after scraping external listings." />
                    )}
                </div>
            )}

            {/* Hot Areas Tab */}
            {activeTab === 'hotareas' && (
                <div className="space-y-6">
                    {hotAreas?.areas?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hotAreas.areas.map((area, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary-600" />
                                            <h4 className="font-semibold text-slate-900">{area.name}</h4>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.trend === 'rising' ? 'bg-green-100 text-green-700' :
                                                area.trend === 'falling' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'}`
                                        }>{area.trend}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-slate-600 mb-3">
                                        <span>{area.listingCount} listings</span>
                                        {area.avgPrice > 0 && <span>Avg LKR {area.avgPrice.toLocaleString()}</span>}
                                    </div>
                                    {area.insight && <p className="text-xs text-slate-500">{area.insight}</p>}
                                    {/* Heat bar */}
                                    <div className="mt-3">
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
                                                style={{ width: `${Math.min(area.heatScore || 50, 100)}%` }}></div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1">Heat: {area.heatScore || 0}/100</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No Hot Areas" description="Hot area analysis will appear after sufficient data is scraped." />
                    )}
                </div>
            )}

            {/* Data Quality Tab */}
            {activeTab === 'quality' && (
                <div className="space-y-6">
                    {dataQuality?.sources?.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Quality Scores by Source</h3>
                            <div className="space-y-6">
                                {dataQuality.sources.map((src, i) => (
                                    <div key={i} className="border border-slate-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-slate-900">{src.name}</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${src.score >= 80 ? 'bg-green-100 text-green-700' :
                                                    src.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`
                                            }>{src.score}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                                            <div className={`h-full rounded-full ${src.score >= 80 ? 'bg-green-500' :
                                                    src.score >= 50 ? 'bg-yellow-500' :
                                                        'bg-red-500'}`}
                                                style={{ width: `${src.score}%` }}></div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-xs text-slate-500">
                                            <div>Total: <span className="font-medium text-slate-700">{src.totalCount}</span></div>
                                            <div>w/ Price: <span className="font-medium text-slate-700">{src.withPrice}%</span></div>
                                            <div>w/ Images: <span className="font-medium text-slate-700">{src.withImages}%</span></div>
                                            <div>w/ Location: <span className="font-medium text-slate-700">{src.withLocation}%</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyState title="No Quality Data" description="Quality analysis will appear after data is scraped." />
                    )}
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ title, description }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 mt-1">{description}</p>
    </div>
);

export default AdminMarketReport;
