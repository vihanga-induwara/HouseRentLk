import Input from '../Input';
import { Sparkles, Loader2 } from 'lucide-react';

const StepDetails = ({ formData, handleChange, priceSuggestion, onFetchPriceSuggestion, onApplyPrice }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Rental Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Monthly Rental (LKR)" name="price" type="number" value={formData.price} onChange={handleChange} />
            <Input label="Advance (Months)" name="advancePayment" type="number" value={formData.advancePayment} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Beds" name="beds" type="number" value={formData.beds} onChange={handleChange} />
            <Input label="Baths" name="baths" type="number" value={formData.baths} onChange={handleChange} />
            <Input label="Size (Sqft)" name="size" type="number" value={formData.size} onChange={handleChange} />
        </div>

        {/* AI Price Suggestion */}
        {formData.town && formData.beds && (
            <div className="mt-4">
                {!priceSuggestion ? (
                    <button
                        type="button"
                        onClick={onFetchPriceSuggestion}
                        className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-200 transition-all"
                    >
                        <Sparkles className="h-4 w-4" /> Get AI Price Suggestion
                    </button>
                ) : priceSuggestion.loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing market data...
                    </div>
                ) : priceSuggestion.error ? (
                    <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                        {priceSuggestion.error}
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                <span className="font-bold text-amber-800">AI Price Suggestion</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priceSuggestion.confidence === 'high' ? 'bg-green-100 text-green-700'
                                : priceSuggestion.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                {priceSuggestion.confidence} confidence
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/70 rounded-lg p-3 text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Suggested</div>
                                <div className="text-lg font-black text-amber-700">LKR {Number(priceSuggestion.suggested_price || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Market Avg</div>
                                <div className="text-lg font-black text-slate-700">LKR {Number(priceSuggestion.market_average || 0).toLocaleString()}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onApplyPrice(priceSuggestion.suggested_price)}
                            className="w-full text-center text-sm font-bold text-amber-700 hover:text-amber-800 bg-white/80 hover:bg-white py-2 rounded-lg border border-amber-300 transition-all"
                        >
                            Apply Suggested Price
                        </button>
                    </div>
                )}
            </div>
        )}

        <label className="flex items-center space-x-2 mt-2">
            <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleChange} className="rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-slate-700 font-medium">Price is Negotiable</span>
        </label>
    </div>
);

export default StepDetails;
