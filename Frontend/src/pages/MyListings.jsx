import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';
import {
    Eye, Edit3, Pause, Play, Home, Trash2, RefreshCw,
    Clock, CheckCircle, XCircle, AlertCircle, MapPin, Calendar,
    BarChart3, Copy, X, MessageSquare, Heart, Share2, TrendingUp, TrendingDown, Info
} from 'lucide-react';

const STATUS_CONFIG = {
    approved: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    paused: { label: 'Paused', color: 'bg-slate-100 text-slate-600', icon: Pause },
    rented: { label: 'Rented', color: 'bg-blue-100 text-blue-700', icon: Home },
    expired: { label: 'Expired', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    changes_requested: { label: 'Changes Needed', color: 'bg-purple-100 text-purple-700', icon: Edit3 },
};

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'rented', label: 'Rented' },
    { key: 'paused', label: 'Paused' },
    { key: 'expired', label: 'Expired' },
];

const MyListings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [analyticsListing, setAnalyticsListing] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [marketInsight, setMarketInsight] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    const fetchMyListings = useCallback(async () => {
        try {
            const { data } = await API.get('/listings/my-listings');
            const now = new Date();
            const updated = data.map(l => {
                if (l.expiresAt && new Date(l.expiresAt) < now && l.status === 'approved') {
                    return { ...l, status: 'expired' };
                }
                return l;
            });
            setListings(updated);
        } catch (error) {
            toast.error('Failed to load your listings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyListings();
    }, [user, fetchMyListings, navigate]);

    const handleStatusChange = async (listingId, newStatus) => {
        setActionLoading(listingId);
        try {
            const { data } = await API.put(`/listings/${listingId}/status`, { status: newStatus });
            setListings(prev => prev.map(l => l._id === listingId ? data : l));
            const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
            toast.success(`Listing set to "${statusLabel}"`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRenew = async (listingId) => {
        setActionLoading(listingId);
        try {
            const { data } = await API.put(`/listings/${listingId}/renew`);
            setListings(prev => prev.map(l => l._id === listingId ? data : l));
            toast.success('Listing renewed for 30 days!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to renew');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (listingId) => {
        if (!window.confirm('Are you sure you want to permanently delete this listing? This cannot be undone.')) return;
        setActionLoading(listingId);
        try {
            await API.delete(`/listings/${listingId}`);
            setListings(prev => prev.filter(l => l._id !== listingId));
            toast.success('Listing deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDuplicate = async (listingId) => {
        if (!window.confirm('Create a copy of this listing?')) return;
        setActionLoading(listingId);
        try {
            const { data } = await API.post(`/listings/${listingId}/duplicate`);
            setListings(prev => [data, ...prev]);
            toast.success('Listing duplicated! You can now edit the copy.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to duplicate');
        } finally {
            setActionLoading(null);
        }
    };

    const fetchAnalytics = async (listing) => {
        setAnalyticsListing(listing);
        setLoadingAnalytics(true);
        try {
            const [analyticsRes, marketRes] = await Promise.all([
                API.get(`/listings/${listing._id}/analytics`),
                API.get(`/listings/${listing._id}/market-insights`)
            ]);
            setAnalyticsData(analyticsRes.data);
            setMarketInsight(marketRes.data);
        } catch (error) {
            toast.error('Failed to load analytics');
            setAnalyticsListing(null);
            console.error(error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const filtered = activeTab === 'all' ? listings : listings.filter(l => l.status === activeTab);

    const getDaysLeft = (expiresAt) => {
        if (!expiresAt) return null;
        const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading your listings...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
                    <p className="text-slate-500 mt-1">{listings.length} total listings</p>
                </div>
                <Link to="/post-ad" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm">+ Post New Ad</Link>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {TABS.map(tab => {
                    const count = tab.key === 'all' ? listings.length : listings.filter(l => l.status === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {tab.label} ({count})
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No listings found</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {filtered.map(listing => {
                    const config = STATUS_CONFIG[listing.status] || STATUS_CONFIG.pending;
                    const StatusIcon = config.icon;
                    const daysLeft = getDaysLeft(listing.expiresAt);
                    const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 5;
                    const isExpired = daysLeft !== null && daysLeft <= 0;
                    const isActing = actionLoading === listing._id;
                    const displayImage = listing.images?.[0] || NO_IMAGE_PLACEHOLDER;

                    return (
                        <div key={listing._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to={`/listings/${listing._id}`} className="flex-shrink-0">
                                    <img src={displayImage} alt={listing.title} className="w-full sm:w-32 h-32 object-cover rounded-xl" />
                                </Link>

                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Link to={`/listings/${listing._id}`} className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors truncate">{listing.title}</Link>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.color}`}><StatusIcon className="h-3.5 w-3.5" />{config.label}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location?.town}</span>
                                        <span className="font-semibold text-slate-700">{formatCurrency(listing.price)}/mo</span>
                                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.views || 0} views</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(listing.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link to={`/edit-listing/${listing._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"><Edit3 className="h-3.5 w-3.5" /> Edit</Link>
                                        {(listing.status === 'approved' || listing.status === 'paused') && (
                                            <button disabled={isActing} onClick={() => handleStatusChange(listing._id, listing.status === 'paused' ? 'pending' : 'paused')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50">
                                                {listing.status === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {listing.status === 'paused' ? 'Resume' : 'Pause'}
                                            </button>
                                        )}
                                        <button disabled={isActing} onClick={() => handleStatusChange(listing._id, listing.status === 'rented' ? 'pending' : 'rented')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${listing.status === 'rented' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} text-xs font-medium transition-colors disabled:opacity-50`}>
                                            <Home className="h-3.5 w-3.5" /> {listing.status === 'rented' ? 'Relist' : 'Mark Rented'}
                                        </button>
                                        {(isExpired || isExpiringSoon) && (
                                            <button disabled={isActing} onClick={() => handleRenew(listing._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> Renew 30d</button>
                                        )}
                                        <button disabled={isActing} onClick={() => handleDuplicate(listing._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                                        <button disabled={isActing} onClick={() => fetchAnalytics(listing)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors disabled:opacity-50"><BarChart3 className="h-3.5 w-3.5" /> Stats</button>
                                        <button disabled={isActing} onClick={() => handleDelete(listing._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Analytics Modal */}
            {analyticsListing && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900">Advanced Analytics</h3>
                            <button onClick={() => setAnalyticsListing(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5 text-slate-500" /></button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-8">
                                <img src={analyticsListing.images?.[0]} className="h-20 w-20 rounded-2xl object-cover shadow-md" alt={`${analyticsListing.title} thumbnail`} />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-lg truncate">{analyticsListing.title}</h4>
                                    <p className="text-sm text-slate-500">{analyticsListing.location?.town}</p>
                                    <div className="text-primary-600 font-bold text-lg mt-1">{formatCurrency(analyticsListing.price)}</div>
                                </div>
                            </div>

                            {loadingAnalytics ? (
                                <div className="py-20 text-center text-slate-500 italic">Synthesizing market data...</div>
                            ) : analyticsData ? (
                                <div className="space-y-6">
                                    {/* Primary Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Views', value: analyticsData.views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
                                            { label: 'Saves', value: analyticsData.favorites, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
                                            { label: 'Inquiries', value: analyticsData.inquiries, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                            { label: 'Shares', value: analyticsData.shares || 0, icon: Share2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                        ].map((stat, i) => (
                                            <div key={i} className={`${stat.bg} p-4 rounded-2xl flex flex-col gap-1 text-center`}>
                                                <stat.icon className={`h-4 w-4 mx-auto ${stat.color} mb-1`} />
                                                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Market Insights */}
                                    {marketInsight && (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Info className="h-4 w-4 text-primary-500" /> Market Context: {analyticsListing.location?.town}
                                            </h5>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-500">Area Average Rent</span>
                                                <span className="text-sm font-bold text-slate-900">LKR {marketInsight.areaAverage.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-slate-500">Your Pricing</span>
                                                <div className="flex items-center gap-1">
                                                    {marketInsight.status === 'good_deal' ? <TrendingDown className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-amber-500" />}
                                                    <span className={`text-sm font-bold ${marketInsight.status === 'good_deal' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {Math.abs(marketInsight.percentDiff)}% {marketInsight.difference < 0 ? 'Below' : 'Above'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (analyticsListing.price / marketInsight.areaAverage) * 50)}%` }}></div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-2 italic text-center">Comparing similar listings in your immediate vicinity.</p>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setAnalyticsListing(null)} className="flex-grow py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Close</button>
                                <button onClick={() => navigate(`/edit-listing/${analyticsListing._id}`)} className="flex-grow py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">Optimize Listing</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListings;
