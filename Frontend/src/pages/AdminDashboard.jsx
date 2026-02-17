import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users, Home as HomeIcon, Eye, Check, X, ShieldAlert, TrendingUp,
    FileText, UserCheck, UserX, Search, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
    const [filters, setFilters] = useState({ role: '', search: '' });

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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, listingsRes, usersRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/listings'),
                API.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setListings(listingsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
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

    const handleUserStatus = async (id, isActive) => {
        try {
            await API.put(`/admin/users/${id}/status`, { isActive });
            toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesRole = filters.role ? u.role === filters.role : true;
        const matchesSearch = filters.search
            ? u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.email.toLowerCase().includes(filters.search.toLowerCase())
            : true;
        return matchesRole && matchesSearch;
    });

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
            <div className="border-b border-slate-200 mb-8">
                <nav className="flex space-x-8">
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
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {u.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUserStatus(u._id, !u.isActive)}
                                                className={`p-2 rounded-lg transition-colors ${u.isActive
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={u.isActive ? 'Suspend User' : 'Activate User'}
                                            >
                                                {u.isActive ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                            </button>
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
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
                                                src={listing.images[0] || 'https://via.placeholder.com/150'}
                                                alt={listing.title}
                                                className="h-12 w-12 rounded-lg object-cover mr-4"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-900 line-clamp-1">{listing.title}</div>
                                                <div className="text-sm text-slate-500">LKR {listing.price.toLocaleString()}</div>
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
