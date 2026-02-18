import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    Users, Calendar, CheckCircle, Clock,
    ArrowRight, MessageSquare, Phone, MoreVertical,
    Filter, Download, Search, Layout
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

const LeadCRM = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                // Fetching bookings as leads
                const res = await API.get('/bookings');
                setBookings(res.data);
            } catch (error) {
                console.error("Failed to fetch leads", error);
                toast.error("Could not load leads");
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const updateLeadStatus = async (id, status) => {
        try {
            await API.put(`/bookings/${id}/status`, { status });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
            toast.success(`Updated to ${status}`);
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const columns = [
        { title: 'New Leads', status: 'pending', color: 'bg-blue-500' },
        { title: 'Confirmed', status: 'confirmed', color: 'bg-green-500' },
        { title: 'Completed', status: 'completed', color: 'bg-slate-400' },
        { title: 'Cancelled', status: 'cancelled', color: 'bg-red-400' }
    ];

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto py-12 px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Lead Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your property inquiries and viewing schedules</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64"
                        />
                    </div>
                    <button className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(col => (
                    <div key={col.status} className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                <h2 className="font-bold text-slate-700 dark:text-slate-200">{col.title}</h2>
                                <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-500">
                                    {bookings.filter(b => b.status === col.status).length}
                                </span>
                            </div>
                            <MoreVertical className="h-4 w-4 text-slate-400 cursor-pointer" />
                        </div>

                        <div className="space-y-4 flex-grow overflow-y-auto">
                            {bookings.filter(b => b.status === col.status).map(lead => (
                                <div
                                    key={lead._id}
                                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                                {lead.renter?.name?.charAt(0) || 'R'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{lead.renter?.name || 'Renter'}</h4>
                                                <p className="text-[10px] text-slate-400">{lead.listing?.title.substring(0, 20)}...</p>
                                            </div>
                                        </div>
                                        <Clock className="h-3 w-3 text-slate-300" />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-4 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                                        <Calendar className="h-3 w-3 inline mr-1 mb-0.5" />
                                        {new Date(lead.date).toLocaleDateString()} at {lead.timeSlot}
                                    </div>

                                    <div className="flex gap-2">
                                        {col.status === 'pending' && (
                                            <button
                                                onClick={() => updateLeadStatus(lead._id, 'confirmed')}
                                                className="flex-grow bg-primary-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {col.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateLeadStatus(lead._id, 'completed')}
                                                className="flex-grow bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Mark Done
                                            </button>
                                        )}
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <MessageSquare className="h-4 w-4 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {bookings.filter(b => b.status === col.status).length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mx-2">
                                    <p className="text-xs text-slate-400">Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeadCRM;
