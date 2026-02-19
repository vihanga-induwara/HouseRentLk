import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import {
    Home, MapPin, DollarSign, List, Image as ImageIcon, CheckCircle,
    ChevronRight, ChevronLeft, Upload, X, Trash2, Sparkles, Loader2, TrendingUp,
    AlertTriangle, ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Click Component
const LocationMarker = ({ setCoordinates }) => {
    useMapEvents({
        click(e) {
            setCoordinates([e.latlng.lat, e.latlng.lng]); // Leaflet uses [lat, lng], backend expects [lng, lat]
        },
    });
    return null;
};

// --- Sub-components (Defined before usage) ---

const StepType = ({ type, setType }) => {
    const types = ['House', 'Boarding Room', 'Annex', 'Apartment', 'Other'];
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">What kind of property?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {types.map((t) => (
                    <div
                        key={t}
                        onClick={() => setType(t)}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all text-center
              ${type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <Home className={`h-8 w-8 mx-auto mb-3 ${type === t ? 'text-primary-600' : 'text-slate-400'}`} />
                        <div className="font-semibold">{t}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StepLocation = ({ formData, handleChange }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Where is it located?</h2>
        <Input label="Town / City" name="town" value={formData.town} onChange={handleChange} placeholder="e.g. Colombo, Kandy" />
        <Input label="Street Name" name="street" value={formData.street} onChange={handleChange} placeholder="e.g. Main Street" />
        <Input label="House Number (Optional)" name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
    </div>
);

const StepMap = ({ coordinates, setCoordinates }) => {
    const position = [coordinates[1], coordinates[0]]; // Leaflet [lat, lng]

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Pin Exact Location</h2>
            <p className="text-slate-500 mb-4">Click on the map to set the location.</p>
            <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 h-[400px] z-0">
                <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}></Marker>
                    <LocationMarker setCoordinates={(coords) => setCoordinates([coords[1], coords[0]])} />
                </MapContainer>
            </div>
            <div className="mt-4 text-sm text-slate-500 text-center">
                Coordinates: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
            </div>
        </div>
    );
};

const StepDetails = ({ formData, handleChange, priceSuggestion, onFetchPriceSuggestion, onApplyPrice }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Rental Details</h2>
        <div className="grid grid-cols-2 gap-4">
            <Input label="Monthly Rental (LKR)" name="price" type="number" value={formData.price} onChange={handleChange} />
            <Input label="Advance (Months)" name="advancePayment" type="number" value={formData.advancePayment} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-3 gap-4">
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

const StepAmenities = ({ amenities, toggle }) => (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Facilities & Amenities</h2>
        <div className="grid grid-cols-2 gap-4">
            {Object.keys(amenities).map((key) => (
                <label key={key} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all
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

const StepMedia = ({ files, previewUrls, handleFileChange, removeImage, moveImage, formData, setFormData }) => (
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
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {i > 0 && (
                                <button onClick={() => moveImage(i, -1)} className="p-1 bg-white rounded-full hover:bg-slate-100 shadow-sm" title="Move Left">
                                    <ChevronLeft className="h-4 w-4 text-slate-700" />
                                </button>
                            )}
                            {i < previewUrls.length - 1 && (
                                <button onClick={() => moveImage(i, 1)} className="p-1 bg-white rounded-full hover:bg-slate-100 shadow-sm" title="Move Right">
                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                </button>
                            )}
                            <button
                                onClick={() => removeImage(i)}
                                className="p-1 bg-red-500 rounded-full hover:bg-red-600 shadow-sm text-white"
                                title="Remove Image"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {i === 0 && (
                            <div className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[10px] font-bold text-center py-0.5">COVER</div>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Image Quality Indicator */}
            {previewUrls.length > 0 && (
                <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${previewUrls.length >= 5 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' :
                        previewUrls.length >= 3 ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' :
                            'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'
                    }`}>
                    <Sparkles className={`h-5 w-5 shrink-0 mt-0.5 ${previewUrls.length >= 5 ? 'text-emerald-500' : previewUrls.length >= 3 ? 'text-blue-500' : 'text-amber-500'
                        }`} />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: previewUrls.length >= 5 ? '#059669' : previewUrls.length >= 3 ? '#2563eb' : '#d97706' }}>
                            Image Quality: {previewUrls.length >= 5 ? 'Excellent' : previewUrls.length >= 3 ? 'Good' : 'Needs More'}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                            {previewUrls.length >= 5
                                ? `Great! ${previewUrls.length} photos uploaded. Listings with 5+ photos get 3× more inquiries.`
                                : previewUrls.length >= 3
                                    ? `Good start with ${previewUrls.length} photos. Adding 2 more will boost visibility significantly.`
                                    : `Only ${previewUrls.length} photo${previewUrls.length > 1 ? 's' : ''}. We recommend at least 5 photos for best results.`
                            }
                        </p>
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

const StepContact = ({ contactDetails, formData, setFormData, handleChange }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily', 'Weekdays', 'Weekends'];

    const addVisitTime = () => {
        setFormData(prev => ({
            ...prev,
            availableVisits: [...prev.availableVisits, { day: 'Monday', times: '9 AM - 5 PM' }]
        }));
    };

    const removeVisitTime = (index) => {
        setFormData(prev => ({
            ...prev,
            availableVisits: prev.availableVisits.filter((_, i) => i !== index)
        }));
    };

    const updateVisitTime = (index, field, value) => {
        const updated = [...formData.availableVisits];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, availableVisits: updated }));
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Contact Preferences</h2>
                <Input
                    label="Alternative Phone / Office (Optional)"
                    name="phone2"
                    value={contactDetails.phone2}
                    onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, phone2: e.target.value } } })}
                    placeholder="e.g. 0771234567"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="WhatsApp Number"
                        name="whatsapp"
                        value={contactDetails.whatsapp}
                        onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, whatsapp: e.target.value } } })}
                        placeholder="e.g. 94771234567"
                    />
                    <Input
                        label="General Available Times"
                        name="availableTimes"
                        value={contactDetails.availableTimes}
                        onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, availableTimes: e.target.value } } })}
                        placeholder="e.g. Weekdays 9 AM - 6 PM"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Visit Availability Settings</h3>
                    <button
                        onClick={addVisitTime}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                        + Add Slot
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4 italic">Specify when renters can visit the property to reduce back-and-forth calls.</p>

                <div className="space-y-3">
                    {formData.availableVisits.map((v, i) => (
                        <div key={i} className="flex gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="flex-grow">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Day</label>
                                <select
                                    value={v.day}
                                    onChange={(e) => updateVisitTime(i, 'day', e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary-500 h-10 border"
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="flex-grow">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Times</label>
                                <input
                                    type="text"
                                    value={v.times}
                                    onChange={(e) => updateVisitTime(i, 'times', e.target.value)}
                                    placeholder="e.g. 10 AM - 4 PM"
                                    className="w-full h-10 rounded-lg border-slate-200 text-sm focus:ring-primary-500 border px-3"
                                />
                            </div>
                            <button onClick={() => removeVisitTime(i)} className="h-10 w-10 flex items-center justify-center bg-white text-red-500 rounded-lg border border-slate-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {formData.availableVisits.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                            No visiting slots added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
                        <img src={url} className="h-24 w-24 object-cover rounded-lg" />
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

// --- Main Component ---

const STEPS = {
    TYPE: 0,
    LOCATION: 1,
    MAP: 2,
    DETAILS: 3,
    AMENITIES: 4,
    MEDIA: 5,
    CONTACT: 6,
    PREVIEW: 7,
};

const PostAd = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(STEPS.TYPE);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // AI State
    const [priceSuggestion, setPriceSuggestion] = useState(null);
    const [aiTitle, setAiTitle] = useState(null);
    const [spamWarning, setSpamWarning] = useState(null);

    const [formData, setFormData] = useState({
        type: 'House',
        town: '',
        street: '',
        houseNumber: '',
        address: '',
        coordinates: [80.7718, 7.8731],
        price: '',
        negotiable: false,
        advancePayment: 0,
        minRentalPeriod: 1,
        beds: 1,
        baths: 1,
        size: '',
        furnished: 'Unfurnished',
        amenities: {
            solarPower: false,
            ac: false,
            parking: false,
            wifi: false,
            attachedBath: false,
            petsAllowed: false,
            security: false,
            garden: false,
            waterSupply: 'Tap',
            servantQuarters: false,
            templeDistance: '',
            mainRoadDistance: '',
        },
        contactDetails: {
            phone2: '',
            whatsapp: '',
            whatsappMsg: "Hi, I'm interested in this property.",
            availableTimes: '',
        },
        title: '',
        description: '',
        images: [],
        video: '',
        virtualTourUrl: '',
        availableVisits: [],
        isUrgent: false,
        agreementRequired: false,
        availableFrom: new Date().toISOString().split('T')[0],
        tenantType: 'Any',
        houseRules: '',
    });

    // AI Price Suggestion Handler
    const fetchPriceSuggestion = useCallback(async () => {
        if (!formData.town || !formData.beds) return;
        setPriceSuggestion({ loading: true });
        try {
            const { data } = await API.get('/ai/price-suggest', {
                params: { town: formData.town, beds: formData.beds, baths: formData.baths, size: formData.size || 1000 }
            });
            setPriceSuggestion(data);
        } catch (err) {
            setPriceSuggestion({ error: 'Could not fetch price data for this area.' });
        }
    }, [formData.town, formData.beds, formData.baths, formData.size]);

    const applyPrice = useCallback((price) => {
        setFormData(prev => ({ ...prev, price: String(price) }));
        toast.success('Suggested price applied!');
    }, []);

    // AI Title Generator Handler
    const generateSmartTitle = useCallback(async () => {
        setAiTitle({ loading: true });
        try {
            const { data } = await API.post('/ai/generate-title', {
                type: formData.type,
                beds: formData.beds,
                baths: formData.baths,
                town: formData.town,
                price: formData.price,
                tenantType: formData.tenantType,
                amenities: formData.amenities,
                furnished: formData.furnished
            });
            setAiTitle({ data });
        } catch (err) {
            setAiTitle(null);
            toast.error('Title generation failed');
        }
    }, [formData]);

    const applyTitle = useCallback((title) => {
        setFormData(prev => ({ ...prev, title }));
        toast.success('Title applied!');
    }, []);

    const handleNext = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAmenityChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [name]: value !== undefined ? value : !prev.amenities[name],
            },
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        setFiles((prev) => [...prev, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        const newFiles = [...files];
        const newPreviews = [...previewUrls];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newFiles.length) return;

        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        [newPreviews[index], newPreviews[targetIndex]] = [newPreviews[targetIndex], newPreviews[index]];

        setFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Validation
            if (!formData.town || !formData.street) {
                toast.error('Please fill in all location details');
                setLoading(false);
                return;
            }

            if (!formData.price || !formData.beds || !formData.baths || !formData.size) {
                toast.error('Please fill in all property details');
                setLoading(false);
                return;
            }

            let imageUrls = [];

            // Run spam check in background (non-blocking warning)
            try {
                const spamRes = await API.post('/ai/spam-check', {
                    title: formData.title || '',
                    description: formData.description || '',
                    price: Number(formData.price),
                    town: formData.town
                });
                if (spamRes.data.verdict === 'spam') {
                    toast.error('Your listing was flagged as suspicious. Please review the content.', { duration: 5000 });
                    setSpamWarning(spamRes.data);
                    setLoading(false);
                    return;
                } else if (spamRes.data.verdict === 'suspicious') {
                    toast('Your listing has minor quality warnings. It will be reviewed by our team.', { icon: '⚠️', duration: 4000 });
                }
            } catch {
                // Spam check failed — continue anyway
            }
            if (files.length > 0) {
                const uploadData = new FormData();
                files.forEach(file => uploadData.append('images', file));

                const uploadRes = await API.post('/upload/multiple', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrls = uploadRes.data;
            }

            // Convert [lat, lng] to [lng, lat] for GeoJSON
            const geoCoordinates = formData.coordinates
                ? [formData.coordinates[1], formData.coordinates[0]]
                : [79.8612, 6.9271]; // Default to Colombo

            const listingData = {
                title: formData.title || `${formData.type} for Rent in ${formData.town}`,
                description: formData.description || `Beautiful ${formData.type.toLowerCase()} available for rent in ${formData.town}.`,
                type: formData.type,
                location: {
                    town: formData.town,
                    street: formData.street,
                    houseNumber: formData.houseNumber || '',
                    address: `${formData.houseNumber ? formData.houseNumber + ', ' : ''}${formData.street}, ${formData.town}`,
                    coordinates: {
                        type: 'Point',
                        coordinates: geoCoordinates // [lng, lat] for GeoJSON
                    }
                },
                price: parseFloat(formData.price),
                negotiable: formData.negotiable || false,
                advancePayment: parseInt(formData.advancePayment) || 0,
                minRentalPeriod: parseInt(formData.minRentalPeriod) || 1,
                beds: parseInt(formData.beds),
                baths: parseInt(formData.baths),
                size: parseFloat(formData.size),
                furnished: formData.furnished || 'Unfurnished',
                amenities: formData.amenities || {},
                images: imageUrls,
                isUrgent: formData.isUrgent || false,
                agreementRequired: formData.agreementRequired || false,
                availableFrom: formData.availableFrom || new Date(),
                tenantType: formData.tenantType || 'Any',
                houseRules: formData.houseRules || '',
                contactDetails: formData.contactDetails,
                virtualTourUrl: formData.virtualTourUrl,
                availableVisits: formData.availableVisits
            };

            await API.post('/listings', listingData);
            toast.success('Ad posted successfully! Pending approval.');
            navigate('/profile');
        } catch (error) {
            console.error('Error posting ad:', error);
            const message = error.response?.data?.message || 'Failed to post ad';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {Object.keys(STEPS).map((stepKey, index) => (
                        <div key={stepKey} className={`text-xs font-semibold uppercase tracking-wider ${index <= currentStep ? 'text-primary-600' : 'text-slate-400'}`}>
                            {stepKey}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / 8) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 min-h-[500px] flex flex-col">
                <div className="flex-grow">
                    {currentStep === STEPS.TYPE && (
                        <StepType type={formData.type} setType={(t) => setFormData({ ...formData, type: t })} />
                    )}
                    {currentStep === STEPS.LOCATION && (
                        <StepLocation formData={formData} handleChange={handleChange} />
                    )}
                    {currentStep === STEPS.MAP && (
                        <StepMap
                            coordinates={formData.coordinates}
                            setCoordinates={(coords) => setFormData((prev) => ({ ...prev, coordinates: coords }))}
                        />
                    )}
                    {currentStep === STEPS.DETAILS && (
                        <StepDetails
                            formData={formData}
                            handleChange={handleChange}
                            priceSuggestion={priceSuggestion}
                            onFetchPriceSuggestion={fetchPriceSuggestion}
                            onApplyPrice={applyPrice}
                        />
                    )}
                    {currentStep === STEPS.AMENITIES && (
                        <StepAmenities amenities={formData.amenities} toggle={handleAmenityChange} />
                    )}
                    {currentStep === STEPS.MEDIA && (
                        <StepMedia
                            files={files}
                            previewUrls={previewUrls}
                            handleFileChange={handleFileChange}
                            removeImage={removeImage}
                            moveImage={moveImage}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === STEPS.CONTACT && (
                        <StepContact
                            contactDetails={formData.contactDetails}
                            formData={formData}
                            setFormData={setFormData}
                            handleChange={handleChange}
                        />
                    )}
                    {currentStep === STEPS.PREVIEW && (
                        <StepPreview
                            formData={formData}
                            previews={previewUrls}
                            handleChange={handleChange}
                            aiTitle={aiTitle}
                            onGenerateTitle={generateSmartTitle}
                            onApplyTitle={applyTitle}
                        />
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="border-slate-200"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    {currentStep === STEPS.PREVIEW ? (
                        <Button onClick={handleSubmit} isLoading={loading}>
                            Post Ad <CheckCircle className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Next Step <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostAd;
