import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Button from '../components/Button';
import VerifiedBadge from '../components/VerifiedBadge';

const Brokers = () => {
    const [brokers, setBrokers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchBrokers = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/users/brokers?name=${searchTerm}&page=${page}`);
                setBrokers(data.data);
                setTotalPages(data.pages);
            } catch (error) {
                console.error('Error fetching brokers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrokers();
    }, [searchTerm, page]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">
                            Verified <span className="text-primary-500">Brokers</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                            Find professional, verified property managers and agents to help you secure the best rental homes in Sri Lanka.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 outline-none focus:border-primary-500 transition-all font-medium text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"></div>
                        ))}
                    </div>
                ) : brokers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {brokers.map(broker => (
                            <Link
                                key={broker._id}
                                to={`/brokers/${broker._id}`}
                                className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-none transition-all duration-500 relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl group-hover:rotate-3 transition-transform">
                                        {broker.avatar ? (
                                            <img src={broker.avatar} alt={broker.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-10 w-10 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-xl text-slate-900 dark:text-white italic tracking-tight">{broker.name}</h3>
                                            {broker.verificationStatus === 'verified' && <ShieldCheck className="h-5 w-5 text-primary-500" />}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Professional Broker</div>
                                    </div>
                                </div>

                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8 font-medium italic">
                                    "{broker.bio || 'Professional real estate consultant specializing in residential rentals across Colombo and Gampaha districts.'}"
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
                                    <div className="text-primary-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                        View Portfolio <ArrowRight className="h-4 w-4" />
                                    </div>
                                    {broker.verificationStatus === 'verified' && <VerifiedBadge size="sm" />}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 font-black uppercase tracking-widest">No brokers found matching your search</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`h-12 w-12 rounded-xl font-black transition-all ${page === p
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-110 shadow-xl'
                                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-primary-500 border border-slate-100 dark:border-slate-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Brokers;
