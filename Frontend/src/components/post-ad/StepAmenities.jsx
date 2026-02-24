const StepAmenities = ({ amenities, toggle }) => (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Facilities & Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {Object.keys(amenities).map((key) => (
                <label key={key} className={`flex items-center p-3 md:p-4 rounded-xl border cursor-pointer transition-all
            ${amenities[key] ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                        type="checkbox"
                        checked={amenities[key]}
                        onChange={() => toggle(key)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 mr-3"
                    />
                    <span className="font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
            ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Proximity Data (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Distance to Nearest Temple/Church (km)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 0.5"
                        value={amenities.templeDistance}
                        onChange={(e) => toggle('templeDistance', e.target.value)}
                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-100 rounded-2xl focus:border-primary-500 bg-slate-50/50 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Distance to Main Road (km)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 0.2"
                        value={amenities.mainRoadDistance}
                        onChange={(e) => toggle('mainRoadDistance', e.target.value)}
                        className="w-full px-5 py-4 text-sm font-bold border-2 border-slate-100 rounded-2xl focus:border-primary-500 bg-slate-50/50 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    </div>
);

export default StepAmenities;
