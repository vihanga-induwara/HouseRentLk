import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';
import { UserPlus, Home, Key, User, MapPin, DollarSign, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Preferences
    const [role, setRole] = useState('renter');
    const navigate = useNavigate();
    const { register, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Validation states
    const [errors, setErrors] = useState({});
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [flexibleBudget, setFlexibleBudget] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        confirmPassword: '',
        preferences: {
            locations: [],
            minBudget: 0,
            maxBudget: 100000,
            propertyTypes: [],
            bedrooms: 1,
            petFriendly: false,
            furnished: 'any'
        }
    });

    const { name, email, password, phone, confirmPassword, preferences } = formData;

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('registerForm');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Don't auto-fill passwords
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    password: '',
                    confirmPassword: ''
                }));
            } catch (e) {
                console.error("Error parsing saved form data.");
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        const dataToSave = { ...formData };
        delete dataToSave.password;
        delete dataToSave.confirmPassword;
        localStorage.setItem('registerForm', JSON.stringify(dataToSave));
    }, [formData]);

    // Name validation logic
    useEffect(() => {
        if (name.length > 0 && name.length < 3) {
            setErrors(prev => ({ ...prev, name: "Name must be at least 3 characters" }));
        } else {
            setErrors(prev => ({ ...prev, name: "" }));
        }
    }, [name]);

    // Phone validation logic
    useEffect(() => {
        if (phone.length > 0 && phone.length < 15) {
            setErrors(prev => ({ ...prev, phone: "Invalid phone number format" }));
        } else {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    }, [phone]);

    // Password strength logic
    useEffect(() => {
        if (!password) {
            setPasswordStrength('');
            setErrors(prev => ({ ...prev, password: "" }));
            return;
        }
        let strength = 'Weak';
        const hasLength = password.length >= 8;
        const hasNumbers = /\d/.test(password);
        const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (hasLength && hasNumbers && hasMixedCase) {
            strength = hasSpecial ? 'Strong' : 'Medium';
            setErrors(prev => ({ ...prev, password: "" }));
        } else {
            strength = 'Weak';
            setErrors(prev => ({
                ...prev,
                password: "Password needs 8+ chars, numbers, upper & lower case."
            }));
        }

        setPasswordStrength(strength);
    }, [password]);

    // Confirm password logic
    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: "" }));
        }
    }, [password, confirmPassword]);

    // Debounced email check
    useEffect(() => {
        const checkEmailExists = async () => {
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setEmailSuccess(false);
                setErrors(prev => ({ ...prev, email: email ? "Invalid email format" : "" }));
                return;
            }
            setCheckingEmail(true);
            try {
                const { data } = await API.get(`/auth/check-email?email=${email}`);
                if (data.exists) {
                    setErrors(prev => ({ ...prev, email: "Email already exists" }));
                    setEmailSuccess(false);
                } else {
                    setErrors(prev => ({ ...prev, email: "" }));
                    setEmailSuccess(true);
                }
            } catch (err) {
                console.error("Email check failed", err);
                // Gracefully degrade: if the check fails (e.g. server not restarted or rate limited),
                // allow submission. The backend /register endpoint will still catch duplicates.
                setErrors(prev => ({ ...prev, email: "" }));
                setEmailSuccess(true);
            } finally {
                setCheckingEmail(false);
            }
        };

        const timer = setTimeout(() => {
            if (email) checkEmailExists();
        }, 500);

        return () => clearTimeout(timer);
    }, [email]);

    const formatPhoneNumber = (value) => {
        // Strip non-digits except +
        let digits = value.replace(/[^\d+]/g, '');
        if (digits.startsWith('0')) {
            digits = '+94' + digits.substring(1);
        } else if (!digits.startsWith('+') && digits.length > 0) {
            digits = '+94' + digits;
        }

        // Add basic formatting like +94 77 123 4567 spacing
        if (digits.length > 3 && digits.startsWith('+94')) {
            digits = digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 12);
        }

        return digits.trim();
    };

    const onChange = (e) => {
        let value = e.target.value;
        const id = e.target.id;

        if (id === 'phone') {
            value = formatPhoneNumber(value);
        }

        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.county;

                    if (city) {
                        const currentLocs = preferences.locations || [];
                        if (!currentLocs.includes(city)) {
                            onPreferenceChange('locations', [...currentLocs, city]);
                            toast.success(`Location detected: ${city}`);
                        }
                    } else {
                        toast.error("Could not determine city from location");
                    }
                } catch (error) {
                    console.error("Error fetching location details:", error);
                    toast.error("Failed to detect location details");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                setIsDetectingLocation(false);
                toast.error("Unable to retrieve your location");
                console.error(error);
            }
        );
    };

    const onPreferenceChange = (field, value) => {
        setFormData((prevState) => ({
            ...prevState,
            preferences: {
                ...prevState.preferences,
                [field]: value
            }
        }));
    };

    const togglePropertyType = (type) => {
        const types = [...preferences.propertyTypes];
        const index = types.indexOf(type);
        if (index > -1) {
            types.splice(index, 1);
        } else {
            types.push(type);
        }
        onPreferenceChange('propertyTypes', types);
    };

    const handleLocationChange = (e) => {
        const locations = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
        onPreferenceChange('locations', locations);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gather all current errors
        const activeErrors = Object.values(errors).filter(err => err !== "");

        if (activeErrors.length > 0) {
            toast.error(activeErrors[0]);
            return;
        }

        if (name.length < 3) {
            toast.error("Name must be at least 3 characters");
            return;
        }

        if (!emailSuccess) {
            toast.error("Please provide a valid, unused email address");
            return;
        }

        if (phone.length < 15) {
            toast.error("Please provide a valid phone number");
            return;
        }

        if (passwordStrength === 'Weak' || !passwordStrength) {
            toast.error("Password is too weak. Please use a stronger password.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const userData = {
            name,
            email,
            password,
            phone,
            role,
            preferences: step === 2 ? preferences : undefined
        };

        try {
            const result = await register(userData);

            if (result.success) {
                // Remove duplicate toast because AuthContext already toasts "Registration successful!"
                const redirectUser = result.user || JSON.parse(localStorage.getItem('user'));
                if (redirectUser?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
            // We do NOT show a fail toast here because AuthContext handles the precise backend error toast.
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="flex justify-center items-center min-h-[80vh] py-8 md:py-12">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 p-3 rounded-full inline-block mb-4">
                        <UserPlus className="h-8 w-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Create Account
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {step === 1 ? 'Join HouseRentLk to find or list properties' : 'Help us personalize your experience'}
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <>
                            {/* Role Selection */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('renter')}
                                    className={`p-3 rounded-lg border text-center transition-all ${role === 'renter'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <User className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                                    <div className="text-sm font-semibold text-slate-700">Renter</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('owner')}
                                    className={`p-3 rounded-lg border text-center transition-all ${role === 'owner'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <Home className="h-6 w-6 mx-auto mb-2 text-secondary-500" />
                                    <div className="text-sm font-semibold text-slate-700">Owner</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('broker')}
                                    className={`p-3 rounded-lg border text-center transition-all ${role === 'broker'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <Key className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                    <div className="text-sm font-semibold text-slate-700">Broker</div>
                                </button>
                            </div>

                            <Input id="name" label="Full Name" placeholder="John Doe" value={name} onChange={onChange} required error={errors.name} success={name.length >= 3} />

                            <div className="relative">
                                <Input id="email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={onChange} required error={errors.email} success={emailSuccess && !checkingEmail} />
                                {checkingEmail && <span className="absolute right-10 top-[40px] text-xs text-slate-400 pointer-events-none z-10">Checking...</span>}
                            </div>

                            <Input id="phone" label="Phone Number" placeholder="+94 77 123 4567" value={phone} onChange={onChange} required error={errors.phone} success={phone.length >= 15 && !errors.phone} />

                            <div>
                                <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={onChange} required error={errors.password} success={(passwordStrength === 'Strong' || passwordStrength === 'Medium') && !errors.password} />
                                {password && (
                                    <div className="mt-1 ml-1 flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                            Strength: {passwordStrength}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={onChange} required error={errors.confirmPassword} success={confirmPassword && confirmPassword === password && !errors.confirmPassword} />

                            <Button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-3 shadow-lg shadow-primary-500/30"
                            >
                                Next: Preferences <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900">Your Rental Preferences (Optional)</h3>

                                {/* Locations */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            <MapPin className="h-4 w-4 inline mr-1" />
                                            Preferred Locations
                                        </label>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={isDetectingLocation}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                        >
                                            {isDetectingLocation ? 'Detecting...' : 'Auto-detect Location'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={(preferences.locations || []).join(', ')}
                                        placeholder="e.g. Colombo, Kandy, Nugegoda"
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Separate multiple locations with commas</p>
                                </div>

                                {/* Budget Range */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            <DollarSign className="h-4 w-4 inline mr-1" />
                                            Budget Range (LKR/month)
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input
                                                type="checkbox"
                                                checked={flexibleBudget}
                                                onChange={(e) => setFlexibleBudget(e.target.checked)}
                                                className="mr-1 rounded text-primary-600 focus:ring-primary-500"
                                            />
                                            Flexible
                                        </label>
                                    </div>

                                    {!flexibleBudget ? (
                                        <>
                                            <div className="px-2 mb-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="200000"
                                                    step="5000"
                                                    value={preferences.maxBudget}
                                                    onChange={(e) => onPreferenceChange('maxBudget', parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
                                                />
                                                <div className="flex justify-between text-xs text-slate-500 mt-2">
                                                    <span>0 LKR</span>
                                                    <span className="font-semibold text-primary-700">{preferences.maxBudget.toLocaleString()} LKR</span>
                                                    <span>200k+ LKR</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={preferences.minBudget}
                                                    onChange={(e) => onPreferenceChange('minBudget', parseInt(e.target.value))}
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={preferences.maxBudget}
                                                    onChange={(e) => onPreferenceChange('maxBudget', parseInt(e.target.value))}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 text-center">
                                            I am open to any budget
                                        </div>
                                    )}
                                </div>

                                {/* Property Types */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Property Types</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['House', 'Apartment', 'Boarding Room', 'Annex'].map(type => (
                                            <label
                                                key={type}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${preferences.propertyTypes.includes(type)
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.propertyTypes.includes(type)}
                                                    onChange={() => togglePropertyType(type)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Preferences */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Bedrooms</label>
                                        <select
                                            value={preferences.bedrooms}
                                            onChange={(e) => onPreferenceChange('bedrooms', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Furnished</label>
                                        <select
                                            value={preferences.furnished}
                                            onChange={(e) => onPreferenceChange('furnished', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="any">Any</option>
                                            <option value="furnished">Furnished</option>
                                            <option value="unfurnished">Unfurnished</option>
                                        </select>
                                    </div>
                                </div>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={preferences.petFriendly}
                                        onChange={(e) => onPreferenceChange('petFriendly', e.target.checked)}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">Pet-friendly properties preferred</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 py-3 shadow-lg shadow-primary-500/30"
                                    isLoading={isLoading}
                                >
                                    Create Account
                                </Button>
                            </div>

                            <button
                                type="submit"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, preferences: {} }));
                                }}
                                className="w-full text-sm text-slate-500 hover:text-primary-600 mt-2"
                            >
                                Skip preferences for now
                            </button>
                        </>
                    )}
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
