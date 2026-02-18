import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import {
    Home, MapPin, DollarSign, List, Image as ImageIcon, CheckCircle,
    ChevronRight, ChevronLeft, Upload, X
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

const StepDetails = ({ formData, handleChange }) => (
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

const StepMedia = ({ files, handleFileChange, removeImage }) => (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Upload Photos</h2>
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative">
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
            <p className="text-sm text-slate-400 mt-1">Minimum 3 photos recommended</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            {files.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const StepContact = ({ contactDetails, handleChange }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Contact Preferences</h2>
        <Input
            label="Alternative Phone (Optional)"
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
                label="Available Calling Times"
                name="availableTimes"
                value={contactDetails.availableTimes}
                onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, availableTimes: e.target.value } } })}
                placeholder="e.g. Weekdays 9 AM - 6 PM"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Pre-filled Message</label>
            <textarea
                className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border bg-white"
                rows="3"
                value={contactDetails.whatsappMsg}
                onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, whatsappMsg: e.target.value } } })}
                placeholder="Hi, I'm interested in your property..."
            ></textarea>
        </div>
    </div>
);

const StepPreview = ({ formData, previews }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Review your Listing</h2>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex gap-4 overflow-x-auto pb-4 mb-4">
                {previews.map((url, i) => (
                    <img key={i} src={url} className="h-24 w-24 object-cover rounded-lg flex-shrink-0" />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <span className="text-sm text-slate-500 block">Property Type</span>
                    <span className="font-semibold">{formData.type}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Price</span>
                    <span className="font-semibold">LKR {formData.price} {formData.negotiable ? '(Negotiable)' : ''}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Location</span>
                    <span className="font-semibold">{formData.town}</span>
                </div>
                <div>
                    <span className="text-sm text-slate-500 block">Size</span>
                    <span className="font-semibold">{formData.size} sqft</span>
                </div>
            </div>
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
        isUrgent: false,
        agreementRequired: false,
        availableFrom: new Date().toISOString().split('T')[0],
        tenantType: 'Any',
        houseRules: '',
    });

    const handleNext = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAmenityChange = (name) => {
        setFormData((prev) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [name]: !prev.amenities[name],
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
                contactDetails: formData.contactDetails
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
                        <StepDetails formData={formData} handleChange={handleChange} />
                    )}
                    {currentStep === STEPS.AMENITIES && (
                        <StepAmenities amenities={formData.amenities} toggle={handleAmenityChange} />
                    )}
                    {currentStep === STEPS.MEDIA && (
                        <StepMedia files={previewUrls} handleFileChange={handleFileChange} removeImage={removeImage} />
                    )}
                    {currentStep === STEPS.CONTACT && (
                        <StepContact contactDetails={formData.contactDetails} handleChange={handleChange} />
                    )}
                    {currentStep === STEPS.PREVIEW && (
                        <StepPreview formData={formData} previews={previewUrls} />
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
