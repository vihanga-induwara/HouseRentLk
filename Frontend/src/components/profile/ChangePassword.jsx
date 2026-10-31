import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { LockKeyhole } from 'lucide-react';
import API from '../../utils/api';
import Button from '../Button';
import Input from '../Input';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_RULE, isStrongPassword } from '../../utils/validation';

const EMPTY = { currentPassword: '', password: '', confirm: '' };

const ChangePassword = () => {
    const { updateUser } = useAuth();
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const passwordError = form.password && !isStrongPassword(form.password) ? PASSWORD_RULE : '';
    const confirmError = form.confirm && form.confirm !== form.password ? 'Passwords do not match' : '';

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordError || confirmError) return;

        setSaving(true);
        try {
            const { data } = await API.put('/auth/profile', {
                currentPassword: form.currentPassword,
                password: form.password,
            });
            updateUser(data);
            setForm(EMPTY);
            toast.success('Password updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 rounded-xl">
                    <LockKeyhole className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Change Password</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <Input id="currentPassword" name="currentPassword" type="password" label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={handleChange} required />
                <Input id="newPassword" name="password" type="password" label="New password" autoComplete="new-password" value={form.password} onChange={handleChange} error={passwordError} required />
                <Input id="confirmPassword" name="confirm" type="password" label="Confirm new password" autoComplete="new-password" value={form.confirm} onChange={handleChange} error={confirmError} required />
                <div className="md:col-span-3 flex justify-end">
                    <Button type="submit" isLoading={saving} disabled={!form.currentPassword || !form.password || !!passwordError || !!confirmError}>
                        Update password
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
