import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import {
    Home, ChevronRight, ChevronLeft, Upload, X, CheckCircle, Save, Trash2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ setCoordinates }) => {
    useMapEvents({
        click(e) {
            setCoordinates([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
};

const STEPS = { DETAILS: 0, AMENITIES: 1, MEDIA: 2, CONTACT: 3, PREVIEW: 4 };

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [formData, setFormData] = useState({
        title: '', description: '', type: 'House',
        town: '', street: '', houseNumber: '', address: '',
        coordinates: [80.7718, 7.8731],
        price: '', negotiable: false, advancePayment: 0, minRentalPeriod: 1,
        beds: 1, baths: 1, size: '', furnished: 'Unfurnished',
        amenities: {
            solarPower: false, ac: false, parking: false, wifi: false,
            attachedBath: false, petsAllowed: false, security: false, garden: false,
            waterSupply: 'Tap',
        },
        contactDetails: {
            phone2: '', whatsapp: '',
            whatsappMsg: "Hi, I'm interested in this property.",
            availableTimes: '',
        },
        isUrgent: false, agreementRequired: false,
        virtualTourUrl: '',
        availableVisits: [],
        availableFrom: new Date().toISOString().split('T')[0],
        tenantType: 'Any', houseRules: '',
    });

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { data } = await API.get(`/listings/${id}`);
                const loc = data.location || {};
                const coords = loc.coordinates?.coordinates;

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    type: data.type || 'House',
                    town: loc.town || '',
                    street: loc.street || '',
                    houseNumber: loc.houseNumber || '',
                    address: loc.address || '',
                    coordinates: coords ? [coords[0], coords[1]] : [80.7718, 7.8731],
                    price: data.price || '',
                    negotiable: data.negotiable || false,
                    advancePayment: data.advancePayment || 0,
                    minRentalPeriod: data.minRentalPeriod || 1,
                    beds: data.beds || 1,
                    baths: data.baths || 1,
                    size: data.size || '',
                    furnished: data.furnished || 'Unfurnished',
                    amenities: data.amenities || formData.amenities,
                    contactDetails: { ...formData.contactDetails, ...data.contactDetails },
                    isUrgent: data.isUrgent || false,
                    agreementRequired: data.agreementRequired || false,
                    availableFrom: data.availableFrom ? new Date(data.availableFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    tenantType: data.tenantType || 'Any',
                    houseRules: data.houseRules || '',
                    virtualTourUrl: data.virtualTourUrl || '',
                    availableVisits: data.availableVisits || [],
                });
                setExistingImages(data.images || []);
            } catch (err) {
                toast.error('Failed to load listing');
                navigate('/my-listings');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAmenityChange = (name) => {
        setFormData(prev => ({
            ...prev,
            amenities: { ...prev.amenities, [name]: !prev.amenities[name] },
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const totalImages = existingImages.length + newFiles.length + selectedFiles.length;
        if (totalImages > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }
        setNewFiles(prev => [...prev, ...selectedFiles]);
        setNewPreviews(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))]);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const moveExistingImage = (index, direction) => {
        const updated = [...existingImages];
        const target = index + direction;
        if (target < 0 || target >= updated.length) return;
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setExistingImages(updated);
    };

    const moveNewImage = (index, direction) => {
        const files = [...newFiles];
        const previews = [...newPreviews];
        const target = index + direction;
        if (target < 0 || target >= files.length) return;
        [files[index], files[target]] = [files[target], files[index]];
        [previews[index], previews[target]] = [previews[target], previews[index]];
        setNewFiles(files);
        setNewPreviews(previews);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            let uploadedUrls = [];
            if (newFiles.length > 0) {
                const uploadData = new FormData();
                newFiles.forEach(file => uploadData.append('images', file));
                const uploadRes = await API.post('/upload/multiple', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls = uploadRes.data;
            }

            const allImages = [...existingImages, ...uploadedUrls];

            const geoCoordinates = formData.coordinates
                ? [formData.coordinates[1], formData.coordinates[0]]
                : [79.8612, 6.9271];

            const updateData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                location: {
                    town: formData.town,
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    address: `${formData.houseNumber ? formData.houseNumber + ', ' : ''}${formData.street}, ${formData.town}`,
                    coordinates: { type: 'Point', coordinates: geoCoordinates }
                },
                price: parseFloat(formData.price),
                negotiable: formData.negotiable,
                advancePayment: parseInt(formData.advancePayment) || 0,
                minRentalPeriod: parseInt(formData.minRentalPeriod) || 1,
                beds: parseInt(formData.beds),
                baths: parseInt(formData.baths),
                size: parseFloat(formData.size),
                furnished: formData.furnished,
                amenities: formData.amenities,
                images: allImages,
                isUrgent: formData.isUrgent,
                agreementRequired: formData.agreementRequired,
                availableFrom: formData.availableFrom,
                tenantType: formData.tenantType,
                houseRules: formData.houseRules,
                contactDetails: formData.contactDetails,
                virtualTourUrl: formData.virtualTourUrl,
                availableVisits: formData.availableVisits,
            };

            await API.put(`/listings/${id}`, updateData);
            toast.success('Listing updated! It will be reviewed again.');
            navigate('/my-listings');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading listing...</div>;

    const stepLabels = ['Details', 'Amenities', 'Photos', 'Contact', 'Preview'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Listing</h1>
            <p className="text-slate-500 mb-6">Changes will reset your listing to "Pending" for re-approval.</p>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {stepLabels.map((label, i) => (
                        <div key={label} className={`text-xs font-semibold uppercase tracking-wider ${i <= currentStep ? 'text-primary-600' : 'text-slate-400'}`}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${((currentStep + 1) / stepLabels.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 min-h-[500px] flex flex-col">
                <div className="flex-grow">
                    {/* Step: Details */}
                    {currentStep === STEPS.DETAILS && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900">Property Details</h2>
                            <Input label="Title" name="title" value={formData.title} onChange={handleChange} />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleChange} rows={3}
                                    className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-3 border bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {['House', 'Boarding Room', 'Annex', 'Apartment', 'Other'].map(t => (
                                        <button key={t} type="button" onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Input label="Town" name="town" value={formData.town} onChange={handleChange} />
                                <Input label="Street" name="street" value={formData.street} onChange={handleChange} />
                                <Input label="House No." name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Input label="Monthly Rent (LKR)" name="price" type="number" value={formData.price} onChange={handleChange} />
                                <Input label="Beds" name="beds" type="number" value={formData.beds} onChange={handleChange} />
                                <Input label="Baths" name="baths" type="number" value={formData.baths} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Size (Sqft)" name="size" type="number" value={formData.size} onChange={handleChange} />
                                <Input label="Advance (Months)" name="advancePayment" type="number" value={formData.advancePayment} onChange={handleChange} />
                            </div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleChange} className="rounded text-primary-600" />
                                <span className="text-slate-700 font-medium">Price is Negotiable</span>
                            </label>
                        </div>
                    )}

                    {/* Step: Amenities */}
                    {currentStep === STEPS.AMENITIES && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">Facilities & Amenities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(formData.amenities).map(key => (
                                    <label key={key} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all
                                        ${formData.amenities[key] ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input type="checkbox" checked={formData.amenities[key]} onChange={() => handleAmenityChange(key)}
                                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 mr-3" />
                                        <span className="font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: Media */}
                    {currentStep === STEPS.MEDIA && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Existing Photos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {existingImages.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                                            <img src={url} alt="listing" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {i > 0 && <button onClick={() => moveExistingImage(i, -1)} className="p-1 bg-white rounded-full"><ChevronLeft className="h-4 w-4 text-slate-700" /></button>}
                                                {i < existingImages.length - 1 && <button onClick={() => moveExistingImage(i, 1)} className="p-1 bg-white rounded-full"><ChevronRight className="h-4 w-4 text-slate-700" /></button>}
                                                <button onClick={() => removeExistingImage(i)} className="p-1 bg-red-500 text-white rounded-full"><X className="h-4 w-4" /></button>
                                            </div>
                                            {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[10px] text-center font-bold py-0.5">COVER</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Add More Photos</h3>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                    <p className="font-medium text-slate-600">Click to upload new images</p>
                                    <p className="text-sm text-slate-400 mt-1">{10 - existingImages.length - newFiles.length} slots remaining</p>
                                </div>
                            </div>

                            {newPreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {newPreviews.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-primary-100 ring-2 ring-primary-50">
                                            <img src={url} alt="new" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {i > 0 && <button onClick={() => moveNewImage(i, -1)} className="p-1 bg-white rounded-full"><ChevronLeft className="h-4 w-4 text-slate-700" /></button>}
                                                {i < newPreviews.length - 1 && <button onClick={() => moveNewImage(i, 1)} className="p-1 bg-white rounded-full"><ChevronRight className="h-4 w-4 text-slate-700" /></button>}
                                                <button onClick={() => removeNewImage(i)} className="p-1 bg-red-500 text-white rounded-full"><X className="h-4 w-4" /></button>
                                            </div>
                                            <div className="absolute top-0 right-0 bg-primary-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl">NEW</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Advanced Media</h3>
                                <Input
                                    label="Virtual Tour / 360° Link (Optional)"
                                    placeholder="e.g. Matterport or YouTube 360 link"
                                    value={formData.virtualTourUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, virtualTourUrl: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step: Contact */}
                    {currentStep === STEPS.CONTACT && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Contact Preferences</h2>
                                <Input label="Alternative Phone" name="phone2" value={formData.contactDetails.phone2}
                                    onChange={(e) => setFormData(p => ({ ...p, contactDetails: { ...p.contactDetails, phone2: e.target.value } }))} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="WhatsApp Number" name="whatsapp" value={formData.contactDetails.whatsapp}
                                        onChange={(e) => setFormData(p => ({ ...p, contactDetails: { ...p.contactDetails, whatsapp: e.target.value } }))} />
                                    <Input label="General Available Times" name="availableTimes" value={formData.contactDetails.availableTimes}
                                        onChange={(e) => setFormData(p => ({ ...p, contactDetails: { ...p.contactDetails, availableTimes: e.target.value } }))} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visit Availability</h3>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, availableVisits: [...p.availableVisits, { day: 'Monday', times: '9 AM - 5 PM' }] }))}
                                        className="text-xs font-bold text-primary-600">+ Add Slot</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.availableVisits.map((v, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                            <select value={v.day} onChange={(e) => {
                                                const updated = [...formData.availableVisits];
                                                updated[i].day = e.target.value;
                                                setFormData(p => ({ ...p, availableVisits: updated }));
                                            }} className="bg-transparent border-none text-xs font-medium focus:ring-0">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily', 'Weekdays', 'Weekends'].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <input type="text" value={v.times} onChange={(e) => {
                                                const updated = [...formData.availableVisits];
                                                updated[i].times = e.target.value;
                                                setFormData(p => ({ ...p, availableVisits: updated }));
                                            }} placeholder="Times" className="bg-transparent border-none text-xs flex-grow focus:ring-0" />
                                            <button onClick={() => setFormData(p => ({ ...p, availableVisits: p.availableVisits.filter((_, idx) => idx !== i) }))} className="p-1 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Preview */}
                    {currentStep === STEPS.PREVIEW && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900">Review Changes</h2>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
                                    {[...existingImages, ...newPreviews].map((url, i) => (
                                        <div key={i} className="relative flex-shrink-0">
                                            <img src={url} className="h-24 w-24 object-cover rounded-lg" alt="" />
                                            {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[8px] text-center font-bold py-0.5 rounded-b-lg">COVER</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div><span className="text-sm text-slate-500 block">Title</span><span className="font-semibold text-sm">{formData.title}</span></div>
                                    <div><span className="text-sm text-slate-500 block">Type</span><span className="font-semibold text-sm">{formData.type}</span></div>
                                    <div><span className="text-sm text-slate-500 block">Price</span><span className="font-semibold text-sm">LKR {formData.price}</span></div>
                                    <div><span className="text-sm text-slate-500 block">Location</span><span className="font-semibold text-sm">{formData.town}</span></div>
                                </div>
                                {formData.availableVisits?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Visit Slots</span>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.availableVisits.map((v, i) => (
                                                <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">{v.day}: {v.times}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                                ⚠ Your listing will be set back to "Pending" and require admin re-approval after saving changes.
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0} className="border-slate-200">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    {currentStep === STEPS.PREVIEW ? (
                        <Button onClick={handleSubmit} isLoading={saving}>
                            <Save className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditListing;
