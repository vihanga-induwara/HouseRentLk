import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Check, X, Eye, EyeOff, Flag, RefreshCw, Search, Filter,
    AlertTriangle, ExternalLink, Loader2, ArrowLeft, ChevronLeft, ChevronRight,
    Trash2, Shield, Brain, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminScrapedListings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusCounts, setStatusCounts] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [activeStatus, setActiveStatus] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [townFilter, setTownFilter] = useState('');

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Expanded listing
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchListings();
    }, [user, page, activeStatus, sourceFilter, townFilter]);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page, limit: 20, status: activeStatus,
                ...(sourceFilter && { source: sourceFilter }),
                ...(townFilter && { town: townFilter }),
                ...(searchQuery && { search: searchQuery }),
            });
            const res = await API.get(`/scraping/admin/listings?${params}`);
            setListings(res.data.listings || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
            setStatusCounts(res.data.statusCounts || {});
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch listings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => { setPage(1); fetchListings(); };

    const handleAction = async (id, action) => {
        try {
            await API.put(`/scraping/admin/listings/${id}/${action}`);
            toast.success(`Listing ${action}d`);
            fetchListings();
        } catch {
            toast.error(`Failed to ${action}`);
        }
    };

    const handleReAnalyze = async (id) => {
        try {
            toast.loading('Re-analyzing...', { id: 'analyze' });
            await API.post(`/scraping/admin/listings/${id}/analyze`);
            toast.success('AI analysis updated', { id: 'analyze' });
            fetchListings();
        } catch {
            toast.error('Re-analysis failed', { id: 'analyze' });
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) { toast.error('Select listings first'); return; }
        if (!confirm(`${action} ${selectedIds.length} listings?`)) return;
        try {
            await API.post('/scraping/admin/listings/bulk', { action, listingIds: selectedIds });
            toast.success(`${selectedIds.length} listings ${action}d`);
            setSelectedIds([]);
            fetchListings();
        } catch {
            toast.error(`Bulk ${action} failed`);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === listings.length) setSelectedIds([]);
        else setSelectedIds(listings.map(l => l._id));
    };

    const getScamBadge = (score) => {
        if (score >= 50) return { text: 'HIGH', cls: 'bg-red-100 text-red-700' };
        if (score >= 25) return { text: 'MEDIUM', cls: 'bg-yellow-100 text-yellow-700' };
        return { text: 'LOW', cls: 'bg-green-100 text-green-700' };
    };

    const getPriceBadge = (rating) => {
        switch (rating) {
            case 'Below Market': return { text: '↓ Below Market', cls: 'bg-green-100 text-green-700' };
            case 'Above Market': return { text: '↑ Above Market', cls: 'bg-red-100 text-red-700' };
            case 'Fair': return { text: '✓ Fair Price', cls: 'bg-blue-100 text-blue-700' };
            default: return { text: 'Unknown', cls: 'bg-slate-100 text-slate-500' };
        }
    };

    const statusTabs = [
        { key: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
        { key: 'approved', label: 'Approved', count: statusCounts.approved || 0 },
        { key: 'flagged', label: 'Flagged', count: statusCounts.flagged || 0 },
        { key: 'hidden', label: 'Hidden', count: statusCounts.hidden || 0 },
        { key: 'expired', label: 'Expired', count: statusCounts.expired || 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/scraping')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">📋 Scraped Listings Moderation</h1>
                        <p className="text-slate-500 mt-1">Review, approve, and manage external listings</p>
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="border-b border-slate-200 mb-6">
                <nav className="flex space-x-6">
                    {statusTabs.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveStatus(tab.key); setPage(1); setSelectedIds([]); }}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeStatus === tab.key
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search listings..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <input type="text" value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
                    placeholder="Source..." className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="text" value={townFilter} onChange={e => { setTownFilter(e.target.value); setPage(1); }}
                    placeholder="Town..." className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button onClick={handleSearch} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                    <Filter className="h-4 w-4" />
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-700">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkAction('approve')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">✅ Approve All</button>
                        <button onClick={() => handleBulkAction('hide')} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-xs font-medium hover:bg-slate-700">👁️ Hide All</button>
                        <button onClick={() => handleBulkAction('delete')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">🗑️ Delete All</button>
                        <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50">Clear</button>
                    </div>
                </div>
            )}

            {/* Select All */}
            <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" checked={selectedIds.length === listings.length && listings.length > 0}
                    onChange={selectAll} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-xs text-slate-500">Select All on Page ({listings.length})</span>
                <span className="text-xs text-slate-400 ml-auto">Total: {total}</span>
            </div>

            {/* Listings */}
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
            ) : listings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Listings</h3>
                    <p className="text-slate-500 mt-1">No {activeStatus} listings found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map(l => {
                        const scam = getScamBadge(l.aiAnalysis?.scamRiskScore || 0);
                        const price = getPriceBadge(l.aiAnalysis?.priceRating);
                        const isExpanded = expandedId === l._id;

                        return (
                            <div key={l._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-5 flex items-start gap-4">
                                    {/* Checkbox */}
                                    <input type="checkbox" checked={selectedIds.includes(l._id)}
                                        onChange={() => toggleSelect(l._id)} className="mt-1 rounded border-slate-300 text-primary-600" />

                                    {/* Image */}
                                    {l.images?.[0] && (
                                        <img src={l.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="font-semibold text-slate-900 text-sm truncate">{l.title}</h3>
                                            {l.price > 0 && <span className="text-sm font-bold text-primary-600">LKR {l.price.toLocaleString()}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">📌 {l.sourceWebsite}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${price.cls}`}>{price.text}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scam.cls}`}>🛡️ Risk: {scam.text}</span>
                                            {l.aiAnalysis?.qualityScore > 0 && (
                                                <span className="text-xs text-slate-500">Quality: {l.aiAnalysis.qualityScore}/100</span>
                                            )}
                                            {l.aiAnalysis?.dataCompleteness > 0 && (
                                                <span className="text-xs text-slate-500">Complete: {l.aiAnalysis.dataCompleteness}%</span>
                                            )}
                                        </div>
                                        {l.piiDetected && (
                                            <div className="flex items-center gap-2 mb-2 bg-red-50 px-3 py-1.5 rounded-lg">
                                                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                                <span className="text-xs text-red-600 font-medium">⚠️ PII Detected: {l.piiDetails?.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-slate-500">
                                            {l.location?.town && <span>{l.location.town}, </span>}
                                            {l.location?.district && <span>{l.location.district} • </span>}
                                            {l.beds > 0 && <span>{l.beds} beds • </span>}
                                            {l.baths > 0 && <span>{l.baths} baths • </span>}
                                            {l.type !== 'Unknown' && <span>{l.type} • </span>}
                                            <span>Scraped {new Date(l.scrapedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {l.adminStatus !== 'approved' && (
                                            <button onClick={() => handleAction(l._id, 'approve')} className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                                                <Check className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleAction(l._id, 'hide')} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Hide">
                                            <EyeOff className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleAction(l._id, 'flag')} className="p-2 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors" title="Flag">
                                            <Flag className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleReAnalyze(l._id)} className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="Re-analyze">
                                            <Brain className="h-4 w-4" />
                                        </button>
                                        {l.sourceUrl && (
                                            <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Original">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                        <button onClick={() => setExpandedId(isExpanded ? null : l._id)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Details">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-3">
                                        {l.description && (
                                            <div>
                                                <span className="text-xs font-medium text-slate-500 uppercase">Description</span>
                                                <p className="text-sm text-slate-700 mt-1">{l.description}</p>
                                            </div>
                                        )}
                                        {l.aiAnalysis?.comparisonToLocal && (
                                            <div>
                                                <span className="text-xs font-medium text-slate-500 uppercase">Market Comparison</span>
                                                <p className="text-sm text-slate-700 mt-1">{l.aiAnalysis.comparisonToLocal}</p>
                                            </div>
                                        )}
                                        {l.aiAnalysis?.locationInsights && (
                                            <div>
                                                <span className="text-xs font-medium text-slate-500 uppercase">Location Insights</span>
                                                <p className="text-sm text-slate-700 mt-1">{l.aiAnalysis.locationInsights}</p>
                                            </div>
                                        )}
                                        {l.aiAnalysis?.tags?.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {l.aiAnalysis.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        {l.adminNotes && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <span className="text-xs font-medium text-yellow-700 uppercase flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Admin Notes</span>
                                                <p className="text-sm text-yellow-700 mt-1">{l.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-slate-600">Page {page} of {pages}</span>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminScrapedListings;
