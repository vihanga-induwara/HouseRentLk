import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users, Home as HomeIcon, Eye, Check, X, ShieldAlert, TrendingUp,
    FileText, UserCheck, UserX, Search, Filter, ShieldCheck, Edit2, Trash2, Globe,
    Image as ImageIcon, Layout, Palette, Settings as SettingsIcon, Mail, Phone, MapPin, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [stats, setStats] = useState({});
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [filters, setFilters] = useState({ role: '', search: '' });
    const [actionLoading, setActionLoading] = useState({}); // { [reportId]: true }
    const [siteSettings, setSiteSettings] = useState({
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        officeHours: '',
        socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' }
    });
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            toast.error('Access denied. Admins only.');
            navigate('/');
            return;
        }

        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, loading, navigate]);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [statsRes, listingsRes, usersRes, verificationsRes, reportsRes, settingsRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/listings'),
                API.get('/admin/users'),
                API.get('/verification/pending'),
                API.get('/admin/reports'),
                API.get('/settings')
            ]);
            setStats(statsRes.data);
            setListings(listingsRes.data);
            setUsers(usersRes.data);
            setPendingVerifications(verificationsRes.data);
            setReports(reportsRes.data);
            setSiteSettings(settingsRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleListingStatus = async (id, status) => {
        try {
            await API.put(`/admin/listings/${id}/status`, { status });
            toast.success(`Listing ${status} successfully`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const handleUserStatus = async (id, status) => {
        try {
            await API.put(`/admin/users/${id}/status`, { status });
            toast.success(`User status updated to ${status} successfully`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user and all their listings? This action cannot be undone.')) return;
        try {
            await API.delete(`/admin/users/${id}`);
            toast.success('User deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleVerificationReview = async (userId, status, message) => {
        try {
            await API.put(`/verification/${userId}`, { status, message });
            toast.success(`Verification ${status} successfully`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update verification status');
        }
    };

    const handleReportStatus = async (id, status) => {
        if (actionLoading[id]) return;

        console.log(`[DEBUG] Attempting to update report ${id} to ${status}`);
        setActionLoading(prev => ({ ...prev, [id]: true }));

        try {
            await API.put(`/admin/reports/${id}/status`, { status });
            toast.success(`Report marked as ${status}`);

            // Optimistic update to reflect changes immediately
            setReports(prev => prev.map(report =>
                report._id === id ? { ...report, status } : report
            ));

            // Silent refresh in background
            await fetchData(true);
        } catch (error) {
            console.error(`[ERROR] Failed to update report ${id}:`, error);
            toast.error('Failed to update report status');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };
    const handleDeleteListing = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await API.delete(`/listings/${id}`);
            setListings(prev => prev.filter(l => l._id !== id));
            toast.success('Listing deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete listing');
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesRole = !filters.role || u.role === filters.role;
        const matchesSearch = !filters.search ||
            u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.email.toLowerCase().includes(filters.search.toLowerCase());
        return matchesRole && matchesSearch;
    });


    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await API.put('/settings', siteSettings);
            toast.success('Site settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading || isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your platform</p>
                </div>
                <div className="bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 flex items-center text-primary-700 font-medium">
                    <ShieldAlert className="h-5 w-5 mr-2" />
                    Admin Mode
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                <nav className="flex space-x-8 min-w-max">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'dashboard'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <TrendingUp className="h-4 w-4 inline mr-2" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Users className="h-4 w-4 inline mr-2" />
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'listings'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <HomeIcon className="h-4 w-4 inline mr-2" />
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('verifications')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'verifications'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <ShieldCheck className="h-4 w-4 inline mr-2" />
                        Verifications ({pendingVerifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'analytics'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <BarChart className="h-4 w-4 inline mr-2" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('disputes')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'disputes'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <ShieldAlert className="h-4 w-4 inline mr-2" />
                        Disputes ({reports.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('palette')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'palette'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Palette className="h-4 w-4 inline mr-2" />
                        Branding
                    </button>
                    <button
                        onClick={() => setActiveTab('site-settings')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'site-settings'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <SettingsIcon className="h-4 w-4 inline mr-2" />
                        Site Settings
                    </button>
                    <button
                        onClick={() => navigate('/admin/scraping')}
                        className="pb-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                    >
                        <Globe className="h-4 w-4 inline mr-2" />
                        Web Scraping
                    </button>
                </nav>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers || 0}
                            icon={<Users className="h-6 w-6 text-primary-600" />}
                            change={`+${stats.newUsers || 0} this week`}
                        />
                        <StatCard
                            title="Active Listings"
                            value={stats.approvedListings || 0}
                            icon={<FileText className="h-6 w-6 text-green-600" />}
                            change={`${stats.pendingListings || 0} pending`}
                        />
                        <StatCard
                            title="Pending Approvals"
                            value={stats.pendingListings || 0}
                            icon={<Eye className="h-6 w-6 text-yellow-600" />}
                            change="Requires action"
                        />
                        <StatCard
                            title="Total Listings"
                            value={stats.totalListings || 0}
                            icon={<HomeIcon className="h-6 w-6 text-blue-600" />}
                            change="All time"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Users by Role</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Renters', value: stats.usersByRole?.renters || 0 },
                                            { name: 'Owners', value: stats.usersByRole?.owners || 0 },
                                            { name: 'Brokers', value: stats.usersByRole?.brokers || 0 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {[0, 1, 2].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Listing Status */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Listing Status</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={[
                                        { status: 'Approved', count: stats.approvedListings || 0 },
                                        { status: 'Pending', count: stats.pendingListings || 0 },
                                        { status: 'Total', count: stats.totalListings || 0 },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Roles</option>
                            <option value="renter">Renter</option>
                            <option value="owner">Owner</option>
                            <option value="broker">Broker</option>
                        </select>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Joined</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{u.name}</div>
                                                <div className="text-sm text-slate-500">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.status === 'active' ? 'bg-green-100 text-green-800' :
                                                u.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {u.status || (u.isActive ? 'active' : 'suspended')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${u._id}`)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                    title="View Detailed Profile & Edit"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>

                                                {u.status !== 'suspended' ? (
                                                    <button
                                                        onClick={() => handleUserStatus(u._id, 'suspended')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                                                        title="Suspend User"
                                                    >
                                                        <UserX className="h-5 w-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUserStatus(u._id, 'active')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                        title="Activate User"
                                                    >
                                                        <UserCheck className="h-5 w-5" />
                                                    </button>
                                                )}

                                                {u.status !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleUserStatus(u._id, 'blocked')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-800 hover:bg-red-50 transition-colors"
                                                        title="Block User"
                                                    >
                                                        <ShieldAlert className="h-5 w-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Property</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Owner</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {listings.map((listing) => (
                                <tr key={listing._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={listing.images[0] || NO_IMAGE_PLACEHOLDER}
                                                alt={listing.title}
                                                className="h-12 w-12 rounded-lg object-cover mr-4"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-900 line-clamp-1">{listing.title}</div>
                                                <div className="text-sm text-slate-500">{formatCurrency(listing.price)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{listing.owner?.name}</div>
                                        <div className="text-sm text-slate-500">{listing.owner?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`/listings/${listing._id}`, '_blank')}
                                                className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                title="View Listing"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>

                                            <button
                                                onClick={() => navigate(`/edit-listing/${listing._id}`)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Edit Listing"
                                            >
                                                <Edit2 className="h-5 w-5" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteListing(listing._id)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>

                                            {listing.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleListingStatus(listing._id, 'approved')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleListingStatus(listing._id, 'rejected')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
                <div className="space-y-6">
                    {pendingVerifications.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No Pending Requests</h3>
                            <p className="text-slate-500 mt-1">All verification requests have been processed.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingVerifications.map((v) => (
                                <div key={v._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                                    <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center mb-4">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 mr-3">
                                                {v.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{v.name}</div>
                                                <div className="text-xs text-slate-500">{v.email}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">NIC Front</div>
                                            <img src={v.verification?.nicFront} className="rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 w-full" alt="NIC Front" onClick={() => window.open(v.verification.nicFront, '_blank')} />
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">NIC Back</div>
                                            <img src={v.verification?.nicBack} className="rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 w-full" alt="NIC Back" onClick={() => window.open(v.verification.nicBack, '_blank')} />
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">AI confidence Score</span>
                                                <span className="text-xs font-black text-primary-600">88%</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-600 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-4">Review Verification</h4>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message to Owner (Optional)</label>
                                            <textarea
                                                id={`msg-${v._id}`}
                                                className="w-full rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500 text-sm h-32"
                                                placeholder="Explain why the verification was approved or rejected..."
                                            />
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <button
                                                onClick={() => handleVerificationReview(v._id, 'approved', document.getElementById(`msg-${v._id}`).value)}
                                                className="flex-grow py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check className="h-5 w-5" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerificationReview(v._id, 'rejected', document.getElementById(`msg-${v._id}`).value)}
                                                className="flex-grow py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X className="h-5 w-5" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Heatmap Section */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Platform Demand Heatmap</h3>
                            <div className="space-y-6">
                                {['Colombo 03', 'Dehiwala', 'Negombo', 'Gampaha', 'Kandy'].map((town, i) => (
                                    <div key={town} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black text-slate-700">{town}</span>
                                            <span className="text-[10px] font-bold text-slate-400">Demand: {90 - i * 10}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000"
                                                style={{ width: `${90 - i * 10}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Pulse Statistics</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Growth Rate</p>
                                    <p className="text-3xl font-black text-primary-400">+12.4% MoM</p>
                                </div>
                                <div className="pt-8 border-t border-white/10">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">Recommendations</p>
                                    <ul className="space-y-4">
                                        <li className="text-xs flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1"></div>
                                            <p className="text-slate-300">Increase supply in highly active hubs</p>
                                        </li>
                                        <li className="text-xs flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1"></div>
                                            <p className="text-slate-300">Owner verification incentive needed in new towns</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Disputes Tab */}
            {activeTab === 'disputes' && (
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Platform Integrity Center</h3>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black ${reports.filter(r => r.status === 'pending').length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {reports.filter(r => r.status === 'pending').length} Pending Reports
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {reports.length === 0 ? (
                            <div className="p-20 text-center">
                                <ShieldCheck className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No reports found.</p>
                            </div>
                        ) : (
                            reports.map(report => (
                                <div key={report._id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group">
                                    <div className="flex items-start gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${report.status === 'pending' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <ShieldAlert className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'pending' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {report.reason}
                                                </span>
                                                <h4 className="font-black text-slate-900 dark:text-white">{report.listing?.title || 'Deleted Listing'}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${report.status === 'reviewed' ? 'bg-green-100 text-green-700' : report.status === 'dismissed' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">" {report.description} "</p>

                                            <div className="flex items-center gap-4 flex-wrap">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    Reported by {report.reporter?.name || 'Anonymous'} • {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                                {report.contactEmail && (
                                                    <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">
                                                        Contact: {report.contactEmail}
                                                    </p>
                                                )}
                                            </div>

                                            {report.screenshot && (
                                                <button
                                                    onClick={() => window.open(report.screenshot, '_blank')}
                                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                                                >
                                                    <ImageIcon className="h-4 w-4" /> View Screenshot
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => window.open(`/listings/${report.listing?._id}`, '_blank')}
                                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                            title="View Listing"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleReportStatus(report._id, 'reviewed')}
                                                    disabled={actionLoading[report._id]}
                                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[report._id] ? 'Processing...' : 'Resolve'}
                                                </button>
                                                <button
                                                    onClick={() => handleReportStatus(report._id, 'dismissed')}
                                                    disabled={actionLoading[report._id]}
                                                    className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[report._id] ? 'Processing...' : 'Dismiss'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}


            {/* Palette Tab */}
            {activeTab === 'palette' && (
                <div className="max-w-4xl">
                    <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Global Identity Manager</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            {[
                                { name: 'Royal Emerald', color: '#10b981' },
                                { name: 'Oceanic Blue', color: '#3b82f6' },
                                { name: 'Velvet Purple', color: '#8b5cf6' },
                                { name: 'Sunset Orange', color: '#f59e0b' }
                            ].map(theme => (
                                <button
                                    key={theme.name}
                                    className="flex flex-col items-center gap-4 group"
                                    onClick={() => toast.success(`${theme.name} applied globally`)}
                                >
                                    <div
                                        className="w-20 h-20 rounded-[2rem] shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6 ring-4 ring-transparent group-hover:ring-slate-100"
                                        style={{ backgroundColor: theme.color }}
                                    ></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Custom Primary Hex Code</h4>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="#000000"
                                    className="flex-grow px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-primary-500 outline-none"
                                />
                                <button className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 active:scale-95">Update Branding</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Settings Tab */}
            {activeTab === 'site-settings' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-primary-50 rounded-2xl">
                                <SettingsIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Contact & Support Settings</h3>
                                <p className="text-sm text-slate-500 font-medium">Update the public contact information shown on the platform.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Mail className="h-3 w-3" /> Public Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={siteSettings.contactEmail}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Phone className="h-3 w-3" /> Public Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.contactPhone}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <MapPin className="h-3 w-3" /> Office Address
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.contactAddress}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, contactAddress: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Clock className="h-3 w-3" /> Office Hours
                                    </label>
                                    <input
                                        type="text"
                                        value={siteSettings.officeHours}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, officeHours: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 italic">Social Media Links</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
                                        <div key={platform} className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 capitalize">{platform}</label>
                                            <input
                                                type="text"
                                                value={siteSettings.socialLinks[platform]}
                                                onChange={(e) => setSiteSettings({
                                                    ...siteSettings,
                                                    socialLinks: { ...siteSettings.socialLinks, [platform]: e.target.value }
                                                })}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:border-primary-500 outline-none transition-all"
                                                placeholder={`https://${platform}.com/...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saveLoading}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-900/25 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saveLoading ? 'Saving Changes...' : 'Save Site Settings'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon, change }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
            <div className="bg-primary-50 p-3 rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
        <div className="text-xs text-slate-500">{change}</div>
    </div>
);

export default AdminDashboard;
