import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { UserPlus, Home, Key, User, MapPin, DollarSign, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Preferences
    const [role, setRole] = useState('renter');
    const navigate = useNavigate();
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

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

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
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

        if (password !== confirmPassword) {
            alert("Passwords do not match");
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

        const result = await register(userData);
        setIsLoading(false);

        if (result.success) {
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 p-3 rounded-full inline-block mb-4">
                        <UserPlus className="h-8 w-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500 mt-2">
                        {step === 1 ? 'Join HouseRentLk to find or list properties' : 'Help us personalize your experience'}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            1
                        </div>
                        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            2
                        </div>
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

                            <Input id="name" label="Full Name" placeholder="John Doe" value={name} onChange={onChange} required />
                            <Input id="email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={onChange} required />
                            <Input id="phone" label="Phone Number" placeholder="+94 77 123 4567" value={phone} onChange={onChange} required />
                            <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={onChange} required />
                            <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={onChange} required />

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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <MapPin className="h-4 w-4 inline mr-1" />
                                        Preferred Locations
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Colombo, Kandy, Nugegoda"
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Separate multiple locations with commas</p>
                                </div>

                                {/* Budget Range */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <DollarSign className="h-4 w-4 inline mr-1" />
                                        Budget Range (LKR/month)
                                    </label>
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
