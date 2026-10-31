import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import {
    User, Mail, Phone, ShieldCheck, Trash2, Save, ArrowLeft,
    Calendar, UserCheck, UserX, ShieldAlert, FileText, BadgeCheck
} from 'lucide-react';

const AdminUserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: '',
        bio: '',
        isVerified: false,
        renterProfile: {
            isActive: false,
            preferredTowns: [],
            budgetMin: 0,
            budgetMax: 0,
            preferredType: [],
            bedsMin: 0,
            bio: ''
        }
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await API.get(`/admin/users/${id}`);
                setUserData(data.user);
                setStats(data.stats);
                setFormData({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    role: data.user.role || '',
                    status: data.user.status || (data.user.isActive ? 'active' : 'suspended'),
                    bio: data.user.bio || '',
                    isVerified: data.user.isVerified || false,
                    renterProfile: data.user.renterProfile || formData.renterProfile
                });
            } catch {
                toast.error('Failed to load user details');
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleRenterProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            renterProfile: {
                ...prev.renterProfile,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put(`/admin/users/${id}`, formData);
            toast.success('User updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Permanently delete this user and all their listings?')) return;
        try {
            await API.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            navigate('/admin');
        } catch {
            toast.error('Delete failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate('/admin')}
                className="flex items-center text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                        Edit <span className="text-primary-600">User</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Internal Database ID: <span className="font-mono text-xs">{id}</span></p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" /> Delete User
                    </button>
                    <Button onClick={handleSubmit} isLoading={saving} className="gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                        <Save className="h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Summary Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-blue-500"></div>
                        <div className="h-32 w-32 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center text-4xl font-black text-slate-300 overflow-hidden">
                            {userData?.avatar && userData.avatar !== 'default-avatar.png' ? (
                                <img src={userData.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                                userData?.name?.charAt(0)
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 italic">{userData?.name}</h2>
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {userData?.role}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.status === 'active' ? 'bg-green-100 text-green-700' :
                                    formData.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {formData.status}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary-500" /> Platform Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="text-2xl font-black text-slate-900">{stats?.totalListings || 0}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Ads</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="text-2xl font-black text-slate-900">{stats?.approvedListings || 0}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Approved</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(userData?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                            <BadgeCheck className="h-4 w-4" />
                            <span>Last Auth {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Never'}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 italic mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl"><User className="h-5 w-5 text-blue-600" /></div>
                            Core Profile Data
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input name="name" value={formData.name} onChange={handleChange} className="font-bold py-4 px-6 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <Input name="email" value={formData.email} onChange={handleChange} className="font-bold py-4 px-6 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} className="font-bold py-4 px-6 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">User Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full h-[60px] rounded-2xl border-slate-200 border px-6 font-bold focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                                >
                                    <option value="renter">Renter</option>
                                    <option value="owner">Owner</option>
                                    <option value="broker">Broker</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">User Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-2xl border-slate-200 border p-6 font-medium focus:ring-4 focus:ring-primary-500/10 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="flex flex-wrap gap-8 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                                <div>
                                    <div className="text-sm font-black text-slate-900 italic">Verified Badge</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manual Override</div>
                                </div>
                            </div>

                            <div className="flex-grow">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Account Status</label>
                                <div className="flex gap-2">
                                    {['active', 'suspended', 'blocked'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.status === s
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'renter' && (
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 italic mb-8 flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-xl"><BadgeCheck className="h-5 w-5 text-pink-600" /></div>
                                Renter Matching Details
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Towns</label>
                                        <Input
                                            value={formData.renterProfile.preferredTowns.join(', ')}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                renterProfile: { ...prev.renterProfile, preferredTowns: e.target.value.split(',').map(t => t.trim()) }
                                            }))}
                                            className="font-bold py-4 px-6 rounded-2xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min LKR</label>
                                            <Input type="number" name="budgetMin" value={formData.renterProfile.budgetMin} onChange={handleRenterProfileChange} className="font-bold py-4 px-6 rounded-2xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max LKR</label>
                                            <Input type="number" name="budgetMax" value={formData.renterProfile.budgetMax} onChange={handleRenterProfileChange} className="font-bold py-4 px-6 rounded-2xl" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="isActive" checked={formData.renterProfile.isActive} onChange={handleRenterProfileChange} className="sr-only peer" />
                                        <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </label>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 italic">Matching Active</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Appears in property matching results</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserEdit;
