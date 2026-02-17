import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth(); // getting login to refresh user data if needed, or context should update
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        password: '',
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await API.put('/auth/profile', formData);
            // Update local storage and context manually if needed, or rely on re-fetch
            // Ideally AuthContext should have an update function, but we can hack it
            localStorage.setItem('user', JSON.stringify(data));
            window.location.reload(); // Simple reload to refresh context
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
                <div className="md:col-span-1">
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
                        </div>
                    </div>
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
