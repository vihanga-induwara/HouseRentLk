import React, { useState, useCallback } from 'react';
import { MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ListingMap = ({ listing, aiDescription }) => {
    const [commuteAddr, setCommuteAddr] = useState('');
    const [commuteResult, setCommuteResult] = useState(null);
    const [calculatingCommute, setCalculatingCommute] = useState(false);

    const calculateCommute = useCallback(async () => {
        if (!commuteAddr) return;
        if (!listing?.location?.coordinates?.coordinates?.length) {
            toast.error('This listing has no precise location set — commute cannot be calculated.');
            return;
        }
        setCalculatingCommute(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(commuteAddr)}, Sri Lanka`);
            const data = await res.json();

            if (data && data.length > 0) {
                const destLat = parseFloat(data[0].lat);
                const destLon = parseFloat(data[0].lon);

                const propLat = listing.location.coordinates.coordinates[1];
                const propLon = listing.location.coordinates.coordinates[0];

                const R = 6371;
                const dLat = (destLat - propLat) * Math.PI / 180;
                const dLon = (destLon - propLon) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(propLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;

                setCommuteResult({
                    distance: d.toFixed(1),
                    drive: Math.round((d / 30) * 60),
                    bus: Math.round((d / 15) * 60)
                });
            } else {
                toast.error('Location not found. Try a landmark or area name.');
            }
        } catch {
            toast.error('Failed to calculate commute');
        } finally {
            setCalculatingCommute(false);
        }
    }, [commuteAddr, listing]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-black dark:text-white mb-8 italic tracking-tight flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary-500" /> Commute Calculator
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Work / Study Destination</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Fort, Colombo..."
                                value={commuteAddr}
                                onChange={(e) => setCommuteAddr(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && calculateCommute()}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            />
                            <button
                                onClick={calculateCommute}
                                disabled={calculatingCommute || !commuteAddr}
                                aria-label="Calculate commute"
                                className="bg-primary-600 text-white px-4 rounded-2xl disabled:opacity-50 hover:bg-primary-700 transition-colors"
                            >
                                <TrendingUp className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {commuteResult ? (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Min Drive', value: commuteResult.drive },
                                { label: 'Min Bus', value: commuteResult.bus },
                                { label: 'Km Away', value: commuteResult.distance },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                                    <div className="text-primary-600 font-black text-lg mb-1">{value}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase">{label}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 text-xs italic py-4">
                            {listing?.location?.coordinates?.coordinates?.length
                                ? 'Enter a destination to calculate commute time.'
                                : 'Commute unavailable — listing has no precise location.'}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] p-10 border border-primary-100 dark:border-primary-800/40 relative overflow-hidden group">
                <Sparkles className="absolute top-10 right-10 h-12 w-12 text-primary-200 rotate-12 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black mb-8 italic tracking-tight text-primary-900 dark:text-primary-100">Neighborhood Lens</h3>
                <div className="space-y-4">
                    <p className="text-sm font-bold text-primary-700 dark:text-primary-300 italic leading-relaxed">
                        {aiDescription?.townVibe || (listing.location ? `${listing.location.town} is a well-connected residential area with good access to amenities and transport.` : 'This property is in a residential area.')}
                    </p>
                    {listing.availableVisits && listing.availableVisits.length > 0 && (
                        <div className="mt-4">
                            <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">Available for Visits</p>
                            <div className="flex flex-wrap gap-2">
                                {listing.availableVisits.map((v, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/60 dark:bg-primary-800/40 rounded-xl text-xs font-black text-primary-800 dark:text-primary-200 border border-white/40">
                                        {v.day} {v.times}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingMap;
