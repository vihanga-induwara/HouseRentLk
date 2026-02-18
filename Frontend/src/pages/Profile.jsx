import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Camera, Save, ShieldCheck, FileText, AlertCircle, Upload } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        password: '',
    });
    const [nicFiles, setNicFiles] = useState({ front: null, back: null });
    const [nicPreviews, setNicPreviews] = useState({ front: null, back: null });
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                password: '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNicUpload = async (e, side) => {
        const file = e.target.files[0];
        if (!file) return;

        setNicPreviews(prev => ({ ...prev, [side]: URL.createObjectURL(file) }));
        setNicFiles(prev => ({ ...prev, [side]: file }));
    };

    const submitVerification = async () => {
        if (!nicFiles.front || !nicFiles.back) {
            toast.error('Please upload both sides of your NIC');
            return;
        }

        setVerifying(true);
        try {
            // 1. Upload images
            const uploadData = new FormData();
            uploadData.append('images', nicFiles.front);
            uploadData.append('images', nicFiles.back);

            const { data: imageUrls } = await API.post('/upload/multiple', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Submit verification request
            await API.post('/verification', {
                nicFront: imageUrls[0],
                nicBack: imageUrls[1]
            });

            toast.success('Verification submitted successfully!');
            window.location.reload();
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
            const { data } = await API.put('/auth/profile', formData);
            localStorage.setItem('user', JSON.stringify(data));
            window.location.reload();
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar / Avatar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <div className="relative inline-block mb-4">
                            <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600 mx-auto overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0)
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-primary-600 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                        <p className="text-slate-500 capitalize">{user?.role}</p>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
                            <div className="flex items-center text-slate-600">
                                <Mail className="h-4 w-4 mr-3 text-slate-400" />
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Phone className="h-4 w-4 mr-3 text-slate-400" />
                                <span className="text-sm">{user?.phone || 'No phone added'}</span>
                            </div>
                            {user?.isVerified && (
                                <div className="flex items-center text-primary-600 font-bold bg-primary-50 p-2 rounded-lg">
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    <span className="text-xs">Verified Owner</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verification Section */}
                    {user?.role !== 'renter' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className={`h-5 w-5 ${user?.isVerified ? 'text-green-500' : 'text-slate-400'}`} />
                                <h3 className="font-bold text-slate-900">ID Verification</h3>
                            </div>

                            {user?.verification?.status === 'not_submitted' || user?.verification?.status === 'rejected' ? (
                                <div className="space-y-4">
                                    {user?.verification?.status === 'rejected' && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 text-xs">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold">Verification Rejected</p>
                                                <p>{user?.verification?.message}</p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500">Upload your National Identity Card (NIC) to get a verified badge and build trust.</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => handleNicUpload(e, 'front')} />
                                            <div className="aspect-[3/2] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                                                {nicPreviews.front ? <img src={nicPreviews.front} className="w-full h-full object-cover" /> : (
                                                    <>
                                                        <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">NIC Front</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => handleNicUpload(e, 'back')} />
                                            <div className="aspect-[3/2] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                                                {nicPreviews.back ? <img src={nicPreviews.back} className="w-full h-full object-cover" /> : (
                                                    <>
                                                        <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">NIC Back</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>

                                    <Button
                                        onClick={submitVerification}
                                        isLoading={verifying}
                                        variant="outline"
                                        fullWidth
                                        size="sm"
                                        disabled={!nicFiles.front || !nicFiles.back}
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            ) : user?.verification?.status === 'pending' ? (
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                                    <FileText className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-amber-800">Verification Pending</p>
                                    <p className="text-xs text-amber-600 mt-1">Under review by our team.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                                    <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-green-800">Identity Verified</p>
                                    <p className="text-xs text-green-600 mt-1">Verified badge is active.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Details</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled
                                    className="bg-slate-50 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 px-4 py-3 border text-slate-800 bg-white"
                                    placeholder="Tell us a little about yourself..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password (Optional)</label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" isLoading={loading} className="gap-2">
                                    <Save className="h-4 w-4" /> Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
