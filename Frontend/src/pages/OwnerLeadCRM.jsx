import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Download } from 'lucide-react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
    { title: 'New Requests', status: 'pending', color: 'bg-blue-500' },
    { title: 'Confirmed', status: 'confirmed', color: 'bg-green-500' },
    { title: 'Completed', status: 'completed', color: 'bg-slate-400' },
    { title: 'Cancelled / Rejected', status: ['cancelled', 'rejected'], color: 'bg-red-400' },
];

// Actions each side may take; mirrors the API's booking state machine
const ACTIONS = {
    owner: {
        pending: [{ status: 'confirmed', label: 'Confirm', primary: true }, { status: 'rejected', label: 'Reject' }],
        confirmed: [{ status: 'completed', label: 'Mark Done', primary: true }, { status: 'cancelled', label: 'Cancel' }],
    },
    renter: {
        pending: [{ status: 'cancelled', label: 'Cancel request' }],
        confirmed: [{ status: 'cancelled', label: 'Cancel viewing' }],
    },
};

const matchesColumn = (booking, col) =>
    Array.isArray(col.status) ? col.status.includes(booking.status) : booking.status === col.status;

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const LeadCRM = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(user?.role === 'renter' ? 'renter' : 'owner');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await API.get('/bookings');
                setBookings(res.data);
            } catch {
                toast.error("Could not load viewing requests");
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        return bookings
            .filter(b => (view === 'owner' ? b.owner?._id : b.renter?._id) === user?._id)
            .filter(b => !term
                || b.listing?.title?.toLowerCase().includes(term)
                || (view === 'owner' ? b.renter?.name : b.owner?.name)?.toLowerCase().includes(term));
    }, [bookings, view, search, user?._id]);

    const updateLeadStatus = async (id, status) => {
        try {
            const { data } = await API.put(`/bookings/${id}/status`, { status });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: data.status } : b));
            toast.success(`Viewing ${status}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Status update failed");
        }
    };

    const exportCsv = () => {
        const header = ['Listing', view === 'owner' ? 'Renter' : 'Owner', 'Email', 'Phone', 'Date', 'Time', 'Status', 'Message'];
        const rows = visible.map(b => {
            const person = view === 'owner' ? b.renter : b.owner;
            return [b.listing?.title, person?.name, person?.email, person?.phone, new Date(b.date).toLocaleDateString(), b.timeSlot, b.status, b.message];
        });
        const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `viewings-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto py-12 px-4 md:px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Viewings</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {view === 'owner' ? 'Viewing requests for your listings' : 'Viewings you have requested'}
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or listing..."
                            aria-label="Search viewings"
                            className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <button
                        onClick={exportCsv}
                        disabled={visible.length === 0}
                        title="Export to CSV"
                        aria-label="Export to CSV"
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="flex gap-2 mb-8" role="tablist">
                {[['owner', 'Requests for my listings'], ['renter', 'My viewing requests']].map(([key, label]) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={view === key}
                        onClick={() => setView(key)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === key ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLUMNS.map(col => {
                    const items = visible.filter(b => matchesColumn(b, col));
                    return (
                        <div key={col.title} className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-4 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-6 px-4">
                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                <h2 className="font-bold text-slate-700 dark:text-slate-200">{col.title}</h2>
                                <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-500">{items.length}</span>
                            </div>

                            <div className="space-y-4 flex-grow overflow-y-auto">
                                {items.map(lead => {
                                    const person = view === 'owner' ? lead.renter : lead.owner;
                                    const actions = ACTIONS[view][lead.status] || [];
                                    return (
                                        <div key={lead._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                                    {person?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{person?.name || 'Unknown user'}</h4>
                                                    <Link to={`/listings/${lead.listing?._id}`} className="text-[11px] text-primary-600 truncate block">
                                                        {lead.listing?.title || 'Listing removed'}
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-3 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                                                <Calendar className="h-3 w-3 inline mr-1 mb-0.5" />
                                                {new Date(lead.date).toLocaleDateString()} at {lead.timeSlot}
                                                {lead.message && <p className="mt-2 italic">“{lead.message}”</p>}
                                                {person?.phone && <p className="mt-2">📞 <a href={`tel:${person.phone}`}>{person.phone}</a></p>}
                                            </div>

                                            {actions.length > 0 && (
                                                <div className="flex gap-2">
                                                    {actions.map(action => (
                                                        <button
                                                            key={action.status}
                                                            onClick={() => updateLeadStatus(lead._id, action.status)}
                                                            className={`flex-grow py-2 rounded-lg text-xs font-bold transition-colors ${action.primary
                                                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {items.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mx-2">
                                        <p className="text-xs text-slate-400">Nothing here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeadCRM;
