import Input from '../Input';
import { Upload, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

const StepMedia = ({ previewUrls, handleFileChange, removeImage, moveImage, formData, setFormData, qualityIssues = [] }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Media & Tours</h2>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative mb-6">
                <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="font-medium text-slate-600">Click or drag images to upload</p>
                <p className="text-sm text-slate-400 mt-1">First image will be the cover photo. Max 10.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previewUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                        <img src={url} alt={`Property upload preview ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {i > 0 && (
                                <button onClick={() => moveImage(i, -1)} aria-label="Move Image Left" className="p-1 bg-white rounded-full hover:bg-slate-100 shadow-sm" title="Move Left">
                                    <ChevronLeft className="h-4 w-4 text-slate-700" />
                                </button>
                            )}
                            {i < previewUrls.length - 1 && (
                                <button onClick={() => moveImage(i, 1)} aria-label="Move Image Right" className="p-1 bg-white rounded-full hover:bg-slate-100 shadow-sm" title="Move Right">
                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                </button>
                            )}
                            <button
                                onClick={() => removeImage(i)}
                                aria-label="Remove Image"
                                className="p-1 bg-red-500 rounded-full hover:bg-red-600 shadow-sm text-white"
                                title="Remove Image"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {i === 0 && (
                            <div className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[10px] font-bold text-center py-0.5">COVER</div>
                        )}
                        {/* Specific AI issue for this image if any */}
                        {qualityIssues.find(issue => issue.index === i) && (
                            <div className="absolute top-1 right-1 p-1 bg-amber-500 rounded-lg shadow-lg">
                                <Sparkles className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Image Quality Indicator */}
            {previewUrls.length > 0 && (
                <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${qualityIssues.length === 0 && previewUrls.length >= 5 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' :
                    qualityIssues.length > 0 ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' :
                        'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}>
                    <Sparkles className={`h-5 w-5 shrink-0 mt-0.5 ${qualityIssues.length === 0 && previewUrls.length >= 5 ? 'text-emerald-500' : qualityIssues.length > 0 ? 'text-amber-500' : 'text-blue-500'
                        }`} />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: qualityIssues.length === 0 && previewUrls.length >= 5 ? '#059669' : qualityIssues.length > 0 ? '#d97706' : '#2563eb' }}>
                            Image Quality: {qualityIssues.length === 0 && previewUrls.length >= 5 ? 'Excellent' : qualityIssues.length > 0 ? 'Action Required' : 'Good'}
                        </div>
                        {qualityIssues.length > 0 ? (
                            <div className="space-y-1">
                                {qualityIssues.map((issue, i) => (
                                    <p key={i} className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                                        • Image #{issue.index + 1}: {issue.message}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                                {previewUrls.length >= 5
                                    ? `Great! ${previewUrls.length} high-quality photos uploaded.`
                                    : `Good start. Adding ${5 - previewUrls.length} more photos will boost your listing visibility.`
                                }
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Advanced Media</h3>
            <Input
                label="Virtual Tour / 360° Link (Optional)"
                placeholder="e.g. Matterport or YouTube 360 link"
                value={formData.virtualTourUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, virtualTourUrl: e.target.value }))}
            />
            {formData.virtualTourUrl && (
                <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tour Preview</p>
                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center relative group">
                        <iframe
                            src={formData.virtualTourUrl.replace('watch?v=', 'embed/')}
                            className="w-full h-full border-0"
                            allowFullScreen
                            title="360 Preview"
                        ></iframe>
                        <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">* Preview might not work for all links depending on site permissions.</p>
                </div>
            )}
        </div>
    </div>
);

export default StepMedia;
