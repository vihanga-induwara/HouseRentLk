import { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Send, MessageSquare, Phone, CheckCircle, Bell, BellOff } from 'lucide-react';
import Button from '../Button';
import BookViewing from './BookViewing';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/format';

// Labels for the API's price-fairness score
const FAIRNESS_LABELS = {
    great_deal: 'Great Deal',
    fair: 'Fair Price',
    above_market: 'Above Market',
};

const normalizePhone = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('94')) return digits;
    if (digits.startsWith('0')) return '94' + digits.slice(1);
    return digits;
};

const ListingSidebar = ({ listing, priceFairness, user }) => {
    const { price, negotiable, owner, contactDetails, title } = listing;
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);
    const isOwnListing = Boolean(user && owner?._id && user._id === owner._id);
    const fairnessLabel = FAIRNESS_LABELS[priceFairness?.score];

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (user && owner?._id && user._id !== owner._id) {
                try {
                    const { data } = await API.get(`/users/follow-status/${owner._id}`);
                    setIsFollowing(data.isFollowing);
                } catch (err) {
                    console.error('Failed to check follow status', err);
                }
            }
        };
        checkFollowStatus();
    }, [user, owner?._id]);

    const handleFollow = async () => {
        if (!user) { toast.error('Please login to follow'); return; }
        setFollowingLoading(true);
        try {
            if (isFollowing) {
                await API.post(`/users/unfollow/${owner._id}`);
                setIsFollowing(false);
                toast.success('Unfollowed');
            } else {
                await API.post(`/users/follow/${owner._id}`);
                setIsFollowing(true);
                toast.success('Following');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleInquiry = async () => {
        if (!user) { toast.error('Please login'); return; }
        const message = inquiryMsg.trim() || "Hi, I'm interested in your property.";
        setSendingInquiry(true);
        try {
            await API.post('/inquiries', { listingId: listing._id, message });
            setInquirySent(true);
            toast.success('Inquiry Sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send inquiry');
        } finally {
            setSendingInquiry(false);
        }
    };

    const handleWhatsApp = () => {
        const rawPhone = contactDetails?.whatsapp || owner?.phone;
        const phone = normalizePhone(rawPhone);
        if (!phone) { toast.error('No WhatsApp number available'); return; }
        const msg = encodeURIComponent(contactDetails?.whatsappMsg || `Hi, I'm interested in your property "${title}" on HouseRentLk.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    return (
        <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl shadow-slate-200/80 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 lg:p-12 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-500 to-blue-500"></div>

                <div className="mb-8">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Monthly Rent</div>
                    <div className="flex items-baseline gap-2 group">
                        <span className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">{formatCurrency(price)}</span>
                    </div>
                    {negotiable && (
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1 block">Price Negotiable</span>
                    )}

                    {/* AI Price Fairness Badge */}
                    {fairnessLabel && (
                        <div title={priceFairness.message} className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest ${priceFairness.score === 'great_deal'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : priceFairness.score === 'fair'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                            }`}>
                            <Sparkles className="h-4 w-4" />
                            <span>{fairnessLabel}</span>
                            {priceFairness.sampleSize > 0 && (
                                <span className="ml-auto text-[10px] opacity-70 normal-case tracking-normal">vs {priceFairness.sampleSize} similar</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Owner Card */}
                <div className="flex items-center gap-5 p-6 bg-slate-50/80 dark:bg-slate-700/50 rounded-[2.5rem] mb-8 group cursor-pointer border border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl transition-all">
                    <div className="relative">
                        <div className="h-16 w-16 bg-slate-900 dark:bg-slate-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl group-hover:scale-110 transition-transform">
                            {owner?.name?.charAt(0)}
                        </div>
                        {owner?.verificationStatus === 'verified' && (
                            <div className="absolute -bottom-1 -right-1 bg-primary-600 p-2 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 shadow-lg" title="Identity Verified">
                                <ShieldCheck className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900 dark:text-white italic tracking-tight">{owner?.name}</p>
                                {owner?.verificationStatus === 'verified' && <ShieldCheck className="h-4 w-4 text-primary-500" title="Identity Verified" />}
                            </div>
                            {!isOwnListing && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleFollow(); }}
                                    disabled={followingLoading}
                                    className={`p-2 rounded-full transition-all ${isFollowing
                                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30'
                                        : 'bg-slate-100 text-slate-400 hover:text-primary-500 dark:bg-slate-700'
                                        }`}
                                    title={isFollowing ? 'Unfollow' : 'Follow for updates'}
                                >
                                    {isFollowing ? <Bell className="h-4 w-4 fill-current" /> : <BellOff className="h-4 w-4" />}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{owner?.role === 'broker' ? 'Verified Broker' : 'Owner'}</div>
                            {owner?.isEmailVerified && <span className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Email Verified</span>}
                            {owner?.isPhoneVerified && <span className="bg-blue-100 text-blue-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Phone Verified</span>}
                        </div>
                    </div>
                </div>

                {/* Inquiry */}
                <div className="space-y-4">
                    {isOwnListing ? (
                        <p className="text-xs text-slate-500 text-center">This is your listing.</p>
                    ) : !inquirySent ? (
                        <>
                            <textarea
                                value={inquiryMsg}
                                onChange={(e) => setInquiryMsg(e.target.value)}
                                placeholder="Hi, I'm interested in this property. I'd like to..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-medium text-sm resize-none focus:border-primary-500 outline-none transition-colors"
                            />
                            <Button
                                className="w-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 rounded-[1.5rem] active:scale-95 transition-all flex items-center justify-center gap-2"
                                onClick={handleInquiry}
                                isLoading={sendingInquiry}
                                disabled={sendingInquiry}
                            >
                                <Send className="h-4 w-4" /> Send Inquiry
                            </Button>
                            <button
                                onClick={handleWhatsApp}
                                className="w-full py-5 bg-green-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-2xl shadow-green-500/20 active:scale-95"
                            >
                                <MessageSquare className="h-5 w-5 fill-current" /> WhatsApp Chat
                            </button>
                        </>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-8 rounded-[2rem] text-center text-xs font-black uppercase tracking-widest border border-green-100 dark:border-green-800 flex flex-col items-center gap-3">
                            <CheckCircle className="h-8 w-8" /> Inquiry Sent!
                        </div>
                    )}

                    {!isOwnListing && (
                        <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
                            <BookViewing listingId={listing._id} user={user} />
                        </div>
                    )}

                    {owner?.phone && !isOwnListing && (
                        <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Direct Call</span>
                            <a
                                href={`tel:${owner.phone}`}
                                className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-primary-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <Phone className="h-3.5 w-3.5" /> {owner.phone}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingSidebar;
