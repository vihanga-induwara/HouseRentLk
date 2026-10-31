import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, CheckCircle, BadgeCheck } from 'lucide-react';
import API from '../../utils/api';
import Button from '../Button';
import Input from '../Input';
import { useAuth } from '../../context/AuthContext';

const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

const VerifiedBadge = () => (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
        <CheckCircle className="h-4 w-4" /> Verified
    </span>
);

// Email link + SMS code verification. Posting ads requires at least one of them.
const ContactVerification = () => {
    const { user, refreshUser } = useAuth();
    const [sendingEmail, setSendingEmail] = useState(false);
    const [phone, setPhone] = useState(user?.phone || '');
    const [otp, setOtp] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);

    const sendEmailLink = async () => {
        setSendingEmail(true);
        try {
            const { data } = await API.post('/auth/verify-email/send');
            toast.success(data.message);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not send the verification email'));
        } finally {
            setSendingEmail(false);
        }
    };

    const sendCode = async () => {
        setSendingCode(true);
        try {
            const { data } = await API.post('/auth/verify-phone/send', { phone });
            toast.success(data.message);
            setCodeSent(true);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not send the code'));
        } finally {
            setSendingCode(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        setVerifyingCode(true);
        try {
            const { data } = await API.post('/auth/verify-phone', { otp });
            toast.success(data.message);
            setOtp('');
            setCodeSent(false);
            await refreshUser();
        } catch (error) {
            toast.error(errorMessage(error, 'Verification failed'));
        } finally {
            setVerifyingCode(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-xl">
                    <BadgeCheck className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-black text-slate-900 italic tracking-tight text-lg">Contact Verification</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Verify your email or phone to post ads.</p>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-700"><Mail className="h-4 w-4 text-primary-500" /> Email</span>
                        {user?.isEmailVerified && <VerifiedBadge />}
                    </div>
                    {!user?.isEmailVerified && (
                        <Button variant="outline" size="sm" className="w-full" onClick={sendEmailLink} isLoading={sendingEmail}>
                            Send verification link to {user?.email}
                        </Button>
                    )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-700"><Phone className="h-4 w-4 text-primary-500" /> Phone</span>
                        {user?.isPhoneVerified && <VerifiedBadge />}
                    </div>
                    {!user?.isPhoneVerified && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    id="verify-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="07X XXX XXXX"
                                    aria-label="Mobile number"
                                />
                                <Button variant="outline" size="sm" onClick={sendCode} isLoading={sendingCode} disabled={!phone}>
                                    {codeSent ? 'Resend' : 'Send code'}
                                </Button>
                            </div>
                            {codeSent && (
                                <form onSubmit={verifyCode} className="flex gap-2">
                                    <Input
                                        id="verify-otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="6-digit code"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        aria-label="Verification code"
                                    />
                                    <Button type="submit" size="sm" isLoading={verifyingCode} disabled={otp.length !== 6}>
                                        Verify
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactVerification;
