import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Globe, Plus, Play, Square, RefreshCw, Settings, Trash2, Power, ShieldOff,
    Activity, AlertTriangle, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp,
    Zap, Database, Eye, BarChart3, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminScrapingPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [sources, setSources] = useState([]);
    const [health, setHealth] = useState({});
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Scrape form
    const [selectedSources, setSelectedSources] = useState([]);
    const [scrapeType, setScrapeType] = useState('incremental');
    const [scrapeLocation, setScrapeLocation] = useState('');
    const [scrapeMaxPages, setScrapeMaxPages] = useState(3);
    const [isScraping, setIsScraping] = useState(false);

    // Add source modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', slug: '', url: '', scraperScript: '' });

    // Expandable sections
    const [expandedSection, setExpandedSection] = useState('sources');

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [sourcesRes, healthRes, jobsRes] = await Promise.all([
                API.get('/scraping/admin/sources'),
                API.get('/scraping/admin/health'),
                API.get('/scraping/admin/jobs?limit=10'),
            ]);
            setSources(sourcesRes.data);
            setHealth(healthRes.data);
            setJobs(jobsRes.data.jobs || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch scraping data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSource = async () => {
        if (!newSource.name || !newSource.slug || !newSource.url || !newSource.scraperScript) {
            toast.error('All fields are required');
            return;
        }
        try {
            await API.post('/scraping/admin/sources', newSource);
            toast.success('Source added');
            setShowAddModal(false);
            setNewSource({ name: '', slug: '', url: '', scraperScript: '' });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add source');
        }
    };

    const handleToggleSource = async (id) => {
        try {
            await API.put(`/scraping/admin/sources/${id}/toggle`);
            toast.success('Source toggled');
            fetchAll();
        } catch { toast.error('Failed to toggle'); }
    };

    const handleKillSource = async (id, name) => {
        if (!confirm(`⚠️ Kill switch: Disable "${name}" and hide ALL its listings?`)) return;
        try {
            const res = await API.post(`/scraping/admin/sources/${id}/kill`);
            toast.success(res.data.message);
            fetchAll();
        } catch { toast.error('Kill switch failed'); }
    };

    const handleDeleteSource = async (id, name) => {
        if (!confirm(`Delete "${name}" and all its scraped data permanently?`)) return;
        try {
            await API.delete(`/scraping/admin/sources/${id}`);
            toast.success('Source deleted');
            fetchAll();
        } catch { toast.error('Failed to delete'); }
    };

    const handleTriggerScrape = async () => {
        if (selectedSources.length === 0) { toast.error('Select at least one source'); return; }
        setIsScraping(true);
        try {
            const res = await API.post('/scraping/admin/trigger', {
                sourceIds: selectedSources,
                type: scrapeType,
                location: scrapeLocation,
                maxPages: scrapeMaxPages,
            });
            toast.success(`Scrape job started! Job ID: ${res.data.job?._id?.slice(-6)}`);
            setTimeout(fetchAll, 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Scrape failed');
        } finally {
            setIsScraping(false);
        }
    };

    const handleStopJob = async (id) => {
        try {
            await API.post(`/scraping/admin/jobs/${id}/stop`);
            toast.success('Job stopped');
            fetchAll();
        } catch { toast.error('Failed to stop job'); }
    };

    const toggleSourceSelection = (id) => {
        setSelectedSources(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'paused': return 'bg-yellow-100 text-yellow-700';
            case 'disabled': return 'bg-red-100 text-red-700';
            case 'blocked': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getJobStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'stopped': return <Square className="h-4 w-4 text-yellow-500" />;
            default: return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">🔄 Web Scraping Control Panel</h1>
                        <p className="text-slate-500 mt-1">Manage sources, trigger scrapes, monitor health</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/scraping/listings" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Moderation Queue
                    </Link>
                    <Link to="/admin/scraping/market" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Market Report
                    </Link>
                    <Link to="/admin/scraping/settings" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Settings
                    </Link>
                </div>
            </div>

            {/* Health Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg"><Database className="h-5 w-5 text-blue-600" /></div>
                        <span className="text-xs font-medium text-slate-500 uppercase">Total Scraped</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(health.totalScraped || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-50 p-2 rounded-lg"><Zap className="h-5 w-5 text-green-600" /></div>
                        <span className="text-xs font-medium text-slate-500 uppercase">New Today</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{health.newToday || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-yellow-50 p-2 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                        <span className="text-xs font-medium text-slate-500 uppercase">Pending Review</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{health.pending || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`${health.piiAlerts > 0 ? 'bg-red-50' : 'bg-slate-50'} p-2 rounded-lg`}>
                            <AlertTriangle className={`h-5 w-5 ${health.piiAlerts > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-500 uppercase">PII Alerts</span>
                    </div>
                    <p className={`text-2xl font-bold ${health.piiAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>{health.piiAlerts || 0}</p>
                </div>
            </div>

            {/* Sources Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'sources' ? '' : 'sources')}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Scraping Sources</h2>
                        <span className="text-sm text-slate-500">({sources.length} configured)</span>
                    </div>
                    {expandedSection === 'sources' ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                {expandedSection === 'sources' && (
                    <div className="px-6 pb-6">
                        <div className="space-y-3">
                            {sources.map(src => (
                                <div key={src._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedSources.includes(src._id)}
                                            onChange={() => toggleSourceSelection(src._id)}
                                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900">{src.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(src.status)}`}>
                                                    {src.status}
                                                </span>
                                                {src.health?.isBlocked && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">⚠️ Blocked</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Last scrape: {src.health?.lastScrapeAt ? new Date(src.health.lastScrapeAt).toLocaleString() : 'Never'}
                                                {src.health?.totalScraped > 0 && ` • ${src.health.totalScraped} total scraped`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleSource(src._id)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Toggle">
                                            <Power className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleKillSource(src._id, src.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Kill Switch">
                                            <ShieldOff className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteSource(src._id, src.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-colors flex items-center justify-center gap-2">
                            <Plus className="h-4 w-4" /> Add New Source
                        </button>
                    </div>
                )}
            </div>

            {/* Run Scrape Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'run' ? '' : 'run')}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Run Scrape</h2>
                    </div>
                    {expandedSection === 'run' ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                {expandedSection === 'run' && (
                    <div className="px-6 pb-6 space-y-4">
                        <div className="flex gap-4 flex-wrap">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                <div className="flex gap-2">
                                    {['incremental', 'full', 'recheck'].map(t => (
                                        <button key={t} onClick={() => setScrapeType(t)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrapeType === t ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Location (optional)</label>
                                <input type="text" value={scrapeLocation} onChange={e => setScrapeLocation(e.target.value)}
                                    placeholder="e.g. Colombo" className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Max Pages</label>
                                <input type="number" value={scrapeMaxPages} onChange={e => setScrapeMaxPages(Number(e.target.value))}
                                    min={1} max={20} className="w-20 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleTriggerScrape} disabled={isScraping || selectedSources.length === 0}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                {isScraping ? 'Scraping...' : `🚀 Run Scrape (${selectedSources.length} sources)`}
                            </button>
                            <button onClick={fetchAll} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" /> Refresh
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'jobs' ? '' : 'jobs')}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Recent Jobs</h2>
                        <span className="text-sm text-slate-500">({jobs.length})</span>
                    </div>
                    {expandedSection === 'jobs' ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                {expandedSection === 'jobs' && (
                    <div className="px-6 pb-6">
                        {jobs.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-8">No jobs recorded yet. Trigger a scrape above.</p>
                        ) : (
                            <div className="space-y-3">
                                {jobs.map(job => (
                                    <div key={job._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {getJobStatusIcon(job.status)}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 text-sm">#{job._id.slice(-6)}</span>
                                                    <span className="text-xs text-slate-500">{job.sources?.join(', ')}</span>
                                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">{job.type}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {job.stats?.newListings || 0} new • {job.stats?.duplicatesSkipped || 0} dupes • {job.stats?.piiAutoFlagged || 0} PII flagged
                                                    {job.startedAt && ` • ${new Date(job.startedAt).toLocaleString()}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                                        job.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>{job.status}</span>
                                            {job.status === 'running' && (
                                                <button onClick={() => handleStopJob(job._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Stop">
                                                    <Square className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Source Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Scraping Source</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" value={newSource.name} onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                                    placeholder="e.g. ikman.lk" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input type="text" value={newSource.slug} onChange={e => setNewSource({ ...newSource, slug: e.target.value })}
                                    placeholder="e.g. ikman" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                <input type="text" value={newSource.url} onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                                    placeholder="https://ikman.lk/en/ads/..." className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Scraper Script</label>
                                <input type="text" value={newSource.scraperScript} onChange={e => setNewSource({ ...newSource, scraperScript: e.target.value })}
                                    placeholder="e.g. ikman_scraper.py" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleAddSource} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">Add Source</button>
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScrapingPanel;
