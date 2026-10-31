import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';
import ContactVerification from '../components/profile/ContactVerification';
import ChangePassword from '../components/profile/ChangePassword';
import {
    User, Mail, Phone, Camera, Save, ShieldCheck,
    FileText, AlertCircle, Upload, Heart, MapPin,
    Briefcase, Sparkles, CheckCircle, Bell, Users
} from 'lucide-react';

const Profile = () => {
    const { user, updateUser, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        password: '',
    });

    const [renterProfile, setRenterProfile] = useState({
        isActive: false,
        preferredTowns: [],
        budgetMin: '',
        budgetMax: '',
        preferredType: [],
        bedsMin: '',
    });

    const [verifying, setVerifying] = useState(false);
    const [nicFiles, setNicFiles] = useState([]);
    const [nicPreviews, setNicPreviews] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [fetchingFollowers, setFetchingFollowers] = useState(false);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (user?.role === 'broker' || user?.role === 'owner') {
                setFetchingFollowers(true);
                try {
                    const { data } = await API.get('/users/followers');
                    setFollowers(data.data);
                } catch (err) {
                    console.error('Failed to fetch followers', err);
                } finally {
                    setFetchingFollowers(false);
                }
            }
        };
        fetchFollowers();
    }, [user?.role]);



    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                password: '',
            });
            if (user.renterProfile) {
                setRenterProfile({
                    isActive: user.renterProfile.isActive || false,
                    preferredTowns: user.renterProfile.preferredTowns || [],
                    budgetMin: user.renterProfile.budgetMin || '',
                    budgetMax: user.renterProfile.budgetMax || '',
                    preferredType: user.renterProfile.preferredType || [],
                    bedsMin: user.renterProfile.bedsMin || '',
                });
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRenterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRenterProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const uploadData = new FormData();
            uploadData.append('images', file);

            const { data: imageUrls } = await API.post('/upload/multiple', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { data } = await API.put('/auth/profile', { avatar: imageUrls[0] });
            updateUser(data);
            toast.success('Avatar updated!');
        } catch {
            toast.error('Avatar upload failed');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleNicUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNicPreviews(prev => [...prev, ...newPreviews]);
        setNicFiles(prev => [...prev, ...files]);
    };

    const submitVerification = async () => {
        if (nicFiles.length === 0) {
            toast.error('Please upload at least one document');
            return;
        }

        setVerifying(true);
        try {
            const uploadData = new FormData();
            nicFiles.forEach(file => uploadData.append('images', file));

            // Identity documents go to private storage; only admins can view them
            const { data: uploaded } = await API.post('/upload/verification-docs', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const docs = uploaded.map(({ publicId }) => ({ type: 'NIC', publicId }));

            await API.post('/verification', { docs });

            toast.success('Verification submitted successfully!');
            setNicFiles([]);
            setNicPreviews([]);
            await refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setVerifying(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { name, phone, bio } = formData;
            const { data } = await API.put('/auth/profile', { name, phone, bio });
            if (user.role === 'renter') {
                await API.put('/matching/profile', renterProfile);
            }
            updateUser(data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between mb-8 md:mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic">Profile <span className="text-primary-600">Settings</span></h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your identity and matching preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    {/* User Card */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-blue-500"></div>

                        <div className="relative inline-block mb-6 group">
                            <div className="h-40 w-40 rounded-full bg-slate-100 ring-4 ring-white shadow-lg flex items-center justify-center text-5xl font-black text-slate-300 mx-auto overflow-hidden transition-transform group-hover:scale-105 duration-500">
                                {user?.avatar && user.avatar !== 'default-avatar.png' ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0)
                                )}
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 p-3 bg-slate-900 text-white rounded-full hover:bg-primary-600 transition-all cursor-pointer shadow-xl active:scale-90">
                                <Camera className="h-5 w-5" />
                                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                            </label>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">{user?.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {user?.role}
                            </span>
                            {user?.verificationStatus === 'verified' && (
                                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> ID Verified
                                </span>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-left space-y-4">
                            <div className="flex items-center justify-between text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center">
                                    <Mail className="h-5 w-5 mr-4 text-primary-500" />
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</div>
                                        <div className="font-bold text-sm truncate max-w-[120px]">{user?.email}</div>
                                    </div>
                                </div>

                            </div>
                            <div className="flex items-center justify-between text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center">
                                    <Phone className="h-5 w-5 mr-4 text-primary-500" />
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</div>
                                        <div className="font-bold text-sm">{user?.phone || 'Not provided'}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <ContactVerification />

                    {/* Verification Card (ID) */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary-100 rounded-xl">
                                <ShieldCheck className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="font-black text-slate-900 italic tracking-tight text-lg">Identity Verification</h3>
                        </div>

                        {user?.verificationStatus === 'none' || user?.verificationStatus === 'rejected' ? (
                            <div className="space-y-6">
                                {user?.verificationStatus === 'rejected' && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-xs">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <div>
                                            <p className="font-black uppercase tracking-widest mb-1">Rejected</p>
                                            <p className="font-medium">{user?.verificationMessage}</p>
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Upload your NIC or Passport.
                                </p>

                                <div className="space-y-3">
                                    <label className="cursor-pointer block">
                                        <div className="aspect-video border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-primary-300 transition-all duration-300 group overflow-hidden relative">
                                            {nicPreviews.length > 0 ? (
                                                <div className="grid grid-cols-2 w-full h-full gap-1 p-1">
                                                    {nicPreviews.slice(0, 2).map((p, i) => (
                                                        <img key={i} src={p} className="w-full h-full object-cover rounded-lg" alt={`NIC preview ${i + 1}`} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                        <Upload className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Click to upload documents</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" onChange={handleNicUpload} multiple accept="image/jpeg,image/png,image/webp" />
                                    </label>

                                    <Button
                                        onClick={submitVerification}
                                        isLoading={verifying}
                                        disabled={nicFiles.length === 0}
                                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                                    >
                                        Submit for Review
                                    </Button>
                                </div>
                            </div>
                        ) : user?.verificationStatus === 'pending' ? (
                            <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
                                </div>
                                <p className="text-lg font-black text-amber-900 italic">Under Review</p>
                                <p className="text-xs text-amber-700 mt-2 font-medium leading-relaxed">
                                    Our team is verifying your identity.
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 bg-green-50 rounded-[1.5rem] border border-green-100 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <p className="text-lg font-black text-green-900 italic">Fully Verified</p>
                                <p className="text-xs text-green-700 mt-2 font-medium">Your account is in good standing.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    {/* Followers Card (For Brokers/Owners) */}
                    {(user?.role === 'broker' || user?.role === 'owner') && (
                        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 italic">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-100 rounded-xl">
                                        <Users className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your <span className="text-primary-600">Followers</span></h3>
                                </div>
                                <div className="px-4 py-2 bg-slate-100 rounded-2xl text-sm font-black text-slate-600">
                                    {followers.length}
                                </div>
                            </div>

                            {fetchingFollowers ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                                </div>
                            ) : followers.length > 0 ? (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {followers.map((follower) => (
                                        <div key={follower._id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg">
                                                    {follower.avatar && follower.avatar !== 'default-avatar.png' ? (
                                                        <img src={follower.avatar} alt="" className="h-full w-full object-cover rounded-xl" />
                                                    ) : (
                                                        follower.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{follower.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Joined {new Date(follower.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                        No followers yet.<br />Post more listings to build your audience!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Basic Information</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="py-4 px-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary-500/10 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="py-4 px-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary-500/10 font-bold"
                                        placeholder="+94 XX XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">About You</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-2xl border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 px-6 py-4 border text-slate-800 bg-white font-medium resize-none"
                                    placeholder="Tell potential hosts or renters about yourself..."
                                />
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <div className="text-xs text-slate-400 font-medium">
                                    Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Just now'}
                                </div>
                                <Button type="submit" isLoading={loading} className="gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                                    <Save className="h-4 w-4" /> Update Profile
                                </Button>
                            </div>
                        </form>
                    </div>

                    <ChangePassword />

                    {/* Renter Matching Preferences */}
                    {user?.role === 'renter' && (
                        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Heart className="h-24 w-24 text-primary-500" />
                            </div>

                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-2 bg-primary-100 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Matching Preferences</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-primary-50/50 p-6 rounded-[2rem] border border-primary-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${renterProfile.isActive ? 'bg-green-500' : 'bg-slate-300'} transition-colors`}>
                                            <Briefcase className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 italic">Matching Status</div>
                                            <div className="text-xs text-slate-500 font-medium">Turn on to appear in owner search results</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={renterProfile.isActive}
                                            onChange={handleRenterChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> Preferred Towns
                                            </label>
                                            <Input
                                                placeholder="e.g. Colombo 03, Dehiwala"
                                                value={renterProfile.preferredTowns.join(', ')}
                                                onChange={(e) => setRenterProfile(prev => ({ ...prev, preferredTowns: e.target.value.split(',').map(s => s.trim()) }))}
                                                className="py-4 px-6 rounded-2xl border-slate-200 font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Min Budget (LKR)</label>
                                                <Input
                                                    type="number"
                                                    name="budgetMin"
                                                    value={renterProfile.budgetMin}
                                                    onChange={handleRenterChange}
                                                    className="py-4 px-6 rounded-2xl border-slate-200 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Max Budget (LKR)</label>
                                                <Input
                                                    type="number"
                                                    name="budgetMax"
                                                    value={renterProfile.budgetMax}
                                                    onChange={handleRenterChange}
                                                    className="py-4 px-6 rounded-2xl border-slate-200 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Property Type</label>
                                            <select
                                                className="w-full rounded-2xl border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 px-6 py-4 border text-slate-800 bg-white font-bold h-[60px]"
                                                value={renterProfile.preferredType[0] || ''}
                                                onChange={(e) => setRenterProfile(prev => ({ ...prev, preferredType: [e.target.value] }))}
                                            >
                                                <option value="">Any Type</option>
                                                <option value="Apartment">Apartment</option>
                                                <option value="House">House</option>
                                                <option value="Studio">Studio</option>
                                                <option value="Annex">Annex</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Min Bedrooms</label>
                                            <Input
                                                type="number"
                                                name="bedsMin"
                                                value={renterProfile.bedsMin}
                                                onChange={handleRenterChange}
                                                className="py-4 px-6 rounded-2xl border-slate-200 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button onClick={handleSubmit} isLoading={loading} className="gap-2 rounded-2xl px-10 py-4 font-black uppercase tracking-widest text-xs">
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
