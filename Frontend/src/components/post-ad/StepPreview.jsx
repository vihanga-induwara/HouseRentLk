import { Loader2, Sparkles } from 'lucide-react';

const StepPreview = ({ formData, previews, handleChange, aiTitle, onGenerateTitle, onApplyTitle }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Review your Listing</h2>

        {/* Title & Description with AI */}
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-slate-700">Listing Title</label>
                    <button
                        type="button"
                        onClick={onGenerateTitle}
                        disabled={aiTitle?.loading}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 transition-all disabled:opacity-50"
                    >
                        {aiTitle?.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Generate Smart Title
                    </button>
                </div>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={`${formData.type} for Rent in ${formData.town || '...'}`}
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-primary-500 h-11 border px-3"
                />
                {aiTitle?.data && !aiTitle.loading && (
                    <div className="mt-2 bg-violet-50 p-3 rounded-lg border border-violet-200 space-y-2">
                        <p className="text-[10px] text-violet-500 uppercase font-bold">AI Suggestions (click to use)</p>
                        {[aiTitle.data.title, ...(aiTitle.data.alternatives || [])].map((t, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onApplyTitle(t)}
                                className={`block w-full text-left text-sm px-3 py-2 rounded-lg border transition-all ${formData.title === t
                                    ? 'border-violet-400 bg-violet-100 text-violet-800 font-semibold'
                                    : 'border-violet-200 bg-white hover:bg-violet-50 text-slate-700'
                                    }`}
                            >
                                {i === 0 && <span className="text-[9px] font-black text-violet-500 mr-1">⭐ TOP</span>}
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Description (Optional)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your property in detail..."
                    className="w-full rounded-xl border-slate-200 text-sm focus:ring-primary-500 border px-3 py-2"
                />
                <p className="text-[10px] text-slate-400 mt-1">AI will auto-generate a description if left empty.</p>
            </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
                {previews.map((url, i) => (
                    <div key={i} className="relative flex-shrink-0">
                        <img src={url} className="h-24 w-24 object-cover rounded-lg" alt={`Preview ${i + 1}`} />
                        {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[8px] text-center font-bold py-0.5 rounded-b-lg">COVER</span>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <span className="text-sm text-slate-500 block">Property</span>
                    <span className="font-semibold">{formData.type}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Rent</span>
                    <span className="font-semibold">LKR {formData.price}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Location</span>
                    <span className="font-semibold capitalize">{formData.town}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Beds/Baths</span>
                    <span className="font-semibold">{formData.beds}B / {formData.baths}Ba</span>
                </div>
            </div>

            {formData.availableVisits?.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                    <span className="text-sm text-slate-500 block mb-2 font-bold uppercase tracking-wider">Availability for Visits</span>
                    <div className="flex flex-wrap gap-2">
                        {formData.availableVisits.map((v, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium">
                                {v.day}: {v.times}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

export default StepPreview;
