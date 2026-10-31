import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Settings, Eye, Shield, Clock, ArrowLeft, Loader2, Save, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminScrapingSettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [conversionStats, setConversionStats] = useState(null);

    // Local settings state
    const [settings, setSettings] = useState({
        showSnippetOnly: true,
        showImages: true,
        forceSourceLink: true,
        maxExternalPercent: 30,
        organicFirstBoost: true,
        autoExpireDays: 30,
        piiAutoFlag: true,
        conversionTracking: true,
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const [exposureRes, conversionRes] = await Promise.all([
                API.get('/scraping/admin/exposure-rules').catch(() => ({ data: null })),
                API.get('/scraping/admin/conversion-stats').catch(() => ({ data: null })),
            ]);
            setConversionStats(conversionRes.data);
            if (exposureRes.data) {
                setSettings(prev => ({ ...prev, ...exposureRes.data }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await API.put('/scraping/admin/exposure-rules', settings);
            toast.success('Settings saved to backend');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save settings');
        }
    };

    const Toggle = ({ value, onChange, label, description }) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
            <div>
                <p className="font-medium text-slate-900 text-sm">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button onClick={() => onChange(!value)}
                className={`transition-colors ${value ? 'text-primary-600' : 'text-slate-300'}`}>
                {value ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
            </button>
        </div>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/scraping')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">⚙️ Scraping Settings</h1>
                        <p className="text-slate-500 mt-1">Configure display rules, PII controls, and lifecycle</p>
                    </div>
                </div>
                <button onClick={handleSave} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Settings
                </button>
            </div>

            {/* Display Rules */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Display Rules</h2>
                </div>
                <Toggle
                    value={settings.showSnippetOnly}
                    onChange={v => setSettings({ ...settings, showSnippetOnly: v })}
                    label="Snippet Only Mode"
                    description="Show only description snippets for external listings (not full text)"
                />
                <Toggle
                    value={settings.showImages}
                    onChange={v => setSettings({ ...settings, showImages: v })}
                    label="Show Images"
                    description="Display images from scraped listings"
                />
                <Toggle
                    value={settings.forceSourceLink}
                    onChange={v => setSettings({ ...settings, forceSourceLink: v })}
                    label="Force Source Link"
                    description="Always show 'View Original' link next to scraped listings"
                />
            </div>

            {/* Exposure Rules */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Exposure Rules</h2>
                </div>
                <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-medium text-slate-900 text-sm">Max External % in Search</p>
                            <p className="text-xs text-slate-500">Cap how many external listings appear in search results</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} value={settings.maxExternalPercent}
                                onChange={e => setSettings({ ...settings, maxExternalPercent: Number(e.target.value) })}
                                className="w-32 accent-primary-600" />
                            <span className="text-sm font-bold text-primary-600 w-12 text-right">{settings.maxExternalPercent}%</span>
                        </div>
                    </div>
                </div>
                <Toggle
                    value={settings.organicFirstBoost}
                    onChange={v => setSettings({ ...settings, organicFirstBoost: v })}
                    label="Organic-First Boost"
                    description="Always rank organic HouseRentLk listings above external ones"
                />
            </div>

            {/* PII & Safety */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-slate-900">PII & Safety</h2>
                </div>
                <Toggle
                    value={settings.piiAutoFlag}
                    onChange={v => setSettings({ ...settings, piiAutoFlag: v })}
                    label="Auto-Flag PII"
                    description="Automatically flag listings where phone, email, or WhatsApp is detected"
                />
            </div>

            {/* Lifecycle */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Lifecycle</h2>
                </div>
                <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 text-sm">Auto-Expire Days</p>
                            <p className="text-xs text-slate-500">Scraped listings expire after this many days</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" value={settings.autoExpireDays}
                                onChange={e => setSettings({ ...settings, autoExpireDays: Number(e.target.value) })}
                                min={7} max={90}
                                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            <span className="text-sm text-slate-500">days</span>
                        </div>
                    </div>
                </div>
                <Toggle
                    value={settings.conversionTracking}
                    onChange={v => setSettings({ ...settings, conversionTracking: v })}
                    label="Conversion Tracking"
                    description="Track when users click through to external listing sources"
                />
            </div>

            {/* Conversion Stats */}
            {conversionStats && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 Conversion Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">{conversionStats.totalViews?.toLocaleString() || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Total Views</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">{conversionStats.totalClicks?.toLocaleString() || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Click-Throughs</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-primary-600">{conversionStats.conversionRate || '0'}%</p>
                            <p className="text-xs text-slate-500 mt-1">Conversion Rate</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScrapingSettings;
