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
    </div>
);

export default StepAmenities;
