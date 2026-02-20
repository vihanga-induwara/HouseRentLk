import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import { CheckCircle, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Sub-components
import StepType from '../components/post-ad/StepType';
import StepLocation from '../components/post-ad/StepLocation';
import StepMap from '../components/post-ad/StepMap';
import StepDetails from '../components/post-ad/StepDetails';
import StepAmenities from '../components/post-ad/StepAmenities';
import StepMedia from '../components/post-ad/StepMedia';
import StepContact from '../components/post-ad/StepContact';
import StepPreview from '../components/post-ad/StepPreview';

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
    const { user } = useAuth();
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

    // Verification Check
    if (user && !user.isEmailVerified && !user.isPhoneVerified) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <ShieldAlert className="h-16 w-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Verification Required</h2>
                <p className="text-slate-600 max-w-md mb-8">
                    To maintain a safe community, we require all advertisers to verify either their email address or phone number before posting an ad.
                </p>
                <Link to="/profile">
                    <Button className="px-8 py-3">
                        Go to Profile to Verify
                    </Button>
                </Link>
            </div>
        );
    }

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

    const validateStep = (step) => {
        switch (step) {
            case STEPS.TYPE:
                if (!formData.type) {
                    toast.error('Please select a property type');
                    return false;
                }
                return true;
            case STEPS.LOCATION:
                if (!formData.town.trim() || !formData.street.trim()) {
                    toast.error('Please enter both Town/City and Street');
                    return false;
                }
                return true;
            case STEPS.DETAILS:
                if (!formData.price || Number(formData.price) <= 0) {
                    toast.error('Please enter a valid price');
                    return false;
                }
                if (!formData.beds || !formData.baths || !formData.size) {
                    toast.error('Please fill in Bed, Bath, and Size details');
                    return false;
                }
                return true;
            case STEPS.CONTACT:
                if (!formData.contactDetails.phone2 && !formData.contactDetails.whatsapp) {
                    // Optional warning or strict check depending on requirements. 
                    // Let's keep it loose for now but strictly check if account has phone? 
                    // Actually the form defaults are empty strings. 
                    // Let's assume user profile phone is primary, but if they add secondary it should be valid?
                    // For now, let's just return true as contact details are often optional extra fields.
                    return true;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };
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

            // Convert to GeoJSON format [lng, lat]
            // formData.coordinates is already [lng, lat] from StepMap logic
            const geoCoordinates = formData.coordinates
                ? formData.coordinates
                : [79.8612, 6.9271]; // Default to Colombo (Lng, Lat)

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
