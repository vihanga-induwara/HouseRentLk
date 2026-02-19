import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { formatCurrency } from '../utils/format';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';
import {
    X, Check, AlertCircle, Bed, Bath, Layout,
    ArrowLeft, Share2, Heart, ShieldCheck, Sparkles, Loader2, Trophy, Zap
} from 'lucide-react';

const CompareListings = () => {
    const [searchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiComparison, setAiComparison] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const ids = searchParams.get('ids')?.split(',') || [];

    useEffect(() => {
        const fetchListings = async () => {
            if (ids.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const fetched = await Promise.all(
                    ids.map(id => API.get(`/listings/${id}`))
                );
                setListings(fetched.map(res => res.data));

                // Fetch AI comparison
                if (ids.length >= 2) {
                    setAiLoading(true);
                    try {
                        const aiRes = await API.post('/ai/compare', { listingIds: ids });
                        setAiComparison(aiRes.data);
                    } catch (e) {
                        console.error('AI comparison failed', e);
                    } finally {
                        setAiLoading(false);
                    }
                }
            } catch (error) {
                console.error("Comparison fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (listings.length === 0) return (
        <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[3rem] inline-block mb-6">
                <AlertCircle className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No Properties Selected</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Select properties from the browse page to compare them side-by-side.</p>
            <Link to="/browse" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all inline-flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" /> Back to Browse
            </Link>
        </div>
    );

    const Features = [
        { label: 'Price', key: 'price', format: (val) => formatCurrency(val) },
        { label: 'Town', key: 'location.town' },
        { label: 'Type', key: 'type' },
        { label: 'Bedrooms', key: 'beds' },
        { label: 'Bathrooms', key: 'baths' },
        { label: 'Size', key: 'size' },
        { label: 'Furnished', key: 'amenities.furnished', type: 'boolean' },
        { label: 'Parking', key: 'amenities.parking', type: 'boolean' },
        { label: 'WiFi', key: 'amenities.wifi', type: 'boolean' },
        { label: 'Verified', key: 'owner.isVerified', type: 'boolean' }
    ];

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Property Comparison</h1>
                <p className="text-slate-500 dark:text-slate-400">Comparing {listings.length} selected properties in Sri Lanka</p>
            </header>

            {/* AI Comparison Summary */}
            {aiLoading && (
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-violet-100 dark:border-violet-800 mb-8 flex items-center gap-4">
                    <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                    <span className="text-sm font-bold text-violet-600">AI is analyzing properties...</span>
                </div>
            )}
            {aiComparison && !aiLoading && (
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-violet-100 dark:border-violet-800 mb-8">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-xl">
                            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Analysis</h3>
                    </div>

                    {/* Winner Badge */}
                    {aiComparison.winner && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-5 border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                <Trophy className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Best Overall Pick</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">{aiComparison.winner.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{aiComparison.winner.reasons?.join(' · ')}</div>
                            </div>
                        </div>
                    )}

                    {/* Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiComparison.insights?.map((insight, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-start gap-3">
                                <span className="text-xl">{insight.icon}</span>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{insight.category}</div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <p className="mt-5 text-sm font-bold text-slate-600 dark:text-slate-300 italic border-t border-violet-100 dark:border-violet-700 pt-4">
                        {aiComparison.summary}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] gap-px bg-slate-200 dark:bg-slate-700 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
                {/* Attribute Column (Labels) */}
                <div className="hidden md:block">
                    <div className="h-64 bg-slate-50 dark:bg-slate-900/50 p-6 flex items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Feature Details</span>
                    </div>
                    {Features.map((f, i) => (
                        <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                            {f.label}
                        </div>
                    ))}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 h-24"></div>
                </div>

                {/* Property Columns */}
                {listings.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 flex flex-col group">
                        {/* Header Image & Title */}
                        <div className="h-64 relative overflow-hidden">
                            <img src={item.images[0] || NO_IMAGE_PLACEHOLDER} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                                <p className="text-sm opacity-80">{item.location?.town}</p>
                            </div>
                        </div>

                        {/* Features List */}
                        {Features.map((f, i) => (
                            <div key={i} className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between md:justify-center items-center">
                                <span className="md:hidden font-bold text-slate-500 text-sm">{f.label}</span>
                                <div className="text-slate-900 dark:text-white font-medium">
                                    {f.type === 'boolean' ? (
                                        getNestedValue(item, f.key) ? <Check className="text-green-500 h-6 w-6" /> : <X className="text-red-400 h-6 w-6" />
                                    ) : (
                                        f.format ? f.format(getNestedValue(item, f.key)) : getNestedValue(item, f.key) || 'N/A'
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Action Area */}
                        <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 h-24 flex items-center justify-center">
                            <Link to={`/listings/${item._id}`} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all w-full text-center">
                                View Full Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompareListings;
