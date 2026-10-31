import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ShieldCheck, Phone, Mail, MapPin, Calendar, LayoutGrid, List, ArrowLeft, Bell } from 'lucide-react';
import API from '../utils/api';
import ListingCard from '../components/ListingCard';
import VerifiedBadge from '../components/VerifiedBadge';

const BrokerProfile = () => {
    const { id } = useParams();
    const [broker, setBroker] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');

    useEffect(() => {
        const fetchBrokerData = async () => {
            setLoading(true);
            try {
                const [profileRes, listingsRes] = await Promise.all([
                    API.get(`/users/profile/${id}`),
                    API.get(`/listings?owner=${id}`)
                ]);
                setBroker(profileRes.data.data);
                setListings(listingsRes.data.data);
            } catch {
                toast.error('Could not load this profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchBrokerData();
    }, [id]);

    if (loading) return <div className="min-h-screen pt-40 flex justify-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Loading Profile...</div>;
    if (!broker) return <div className="min-h-screen pt-40 text-center">Broker not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/brokers" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-500 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Directory
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Info */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl shadow-slate-200/80 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 md:p-12 sticky top-28">
                            <div className="relative mb-8 text-center">
                                <div className="h-32 w-32 mx-auto rounded-[2rem] bg-slate-100 dark:bg-slate-700 overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl">
                                    {broker.avatar ? (
                                        <img src={broker.avatar} alt={broker.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-16 w-16 text-slate-300 m-auto mt-6" />
                                    )}
                                </div>
                                {broker.verificationStatus === 'verified' && (
                                    <div className="absolute bottom-0 right-1/2 translate-x-[3.5rem] bg-primary-600 p-2.5 rounded-2xl ring-4 ring-white dark:ring-slate-800 shadow-xl">
                                        <ShieldCheck className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-2">{broker.name}</h2>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-6">Certified Real Estate Specialist</div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm italic font-medium">"{broker.bio || 'Committed to finding the perfect home for families across Sri Lanka.'}"</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    <MapPin className="h-5 w-5 text-slate-300" /> Colombo & Western Province
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    <Calendar className="h-5 w-5 text-slate-300" /> Member since {new Date(broker.createdAt).getFullYear()}
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                    <Bell className="h-5 w-5 text-slate-300" /> {listings.length} Active Listings
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a href={`tel:${broker.phone}`} className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-primary-600 dark:hover:bg-primary-500 transform active:scale-95 transition-all shadow-xl">
                                    <Phone className="h-4 w-4" /> Direct Call
                                </a>
                                <button className="flex items-center justify-center gap-3 w-full py-4 bg-primary-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-primary-600 transform active:scale-95 transition-all shadow-xl shadow-primary-500/20">
                                    Follow for Updates
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">My <span className="text-primary-500">Portfolio</span></h3>
                                <div className="h-1.5 w-12 bg-primary-500 rounded-full mt-2"></div>
                            </div>

                            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-primary-500' : 'text-slate-400'}`}>
                                    <LayoutGrid className="h-5 w-5" />
                                </button>
                                <button onClick={() => setView('list')} className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-primary-500' : 'text-slate-400'}`}>
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {listings.length > 0 ? (
                            <div className={`grid gap-8 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {listings.map(listing => (
                                    <ListingCard key={listing._id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 font-black uppercase tracking-widest">No active listings currently available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrokerProfile;
