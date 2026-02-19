import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    MessageSquare, Send, ChevronLeft, Clock, CheckCircle, XCircle, X
} from 'lucide-react';
import { NO_IMAGE_PLACEHOLDER } from '../utils/constants';

const STATUS_STYLE = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
    read: { label: 'Read', color: 'bg-slate-100 text-slate-600' },
    replied: { label: 'Replied', color: 'bg-emerald-100 text-emerald-700' },
    closed: { label: 'Closed', color: 'bg-red-100 text-red-600' },
};

const Inbox = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('received');
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchInquiries();
    }, [user, tab]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'received' ? '/inquiries/received' : '/inquiries/sent';
            const { data } = await API.get(endpoint);
            setInquiries(data);
        } catch {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    const openInquiry = async (id) => {
        try {
            const { data } = await API.get(`/inquiries/${id}`);
            setSelectedInquiry(data);
        } catch {
            toast.error('Failed to load conversation');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            const { data } = await API.post(`/inquiries/${selectedInquiry._id}/reply`, {
                message: replyText.trim()
            });
            setSelectedInquiry(data);
            setReplyText('');
            // Update list status
            setInquiries(prev => prev.map(i =>
                i._id === data._id ? { ...i, status: data.status } : i
            ));
            toast.success('Reply sent!');
        } catch {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await API.put(`/inquiries/${id}/close`);
            setSelectedInquiry(prev => prev ? { ...prev, status: 'closed' } : null);
            setInquiries(prev => prev.map(i =>
                i._id === id ? { ...i, status: 'closed' } : i
            ));
            toast.success('Inquiry closed');
        } catch {
            toast.error('Failed to close');
        }
    };

    const timeAgo = (date) => {
        const s = Math.floor((new Date() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    // Conversation View
    if (selectedInquiry) {
        const listing = selectedInquiry.listing;
        const displayImage = listing?.images?.[0] || NO_IMAGE_PLACEHOLDER;
        const statusStyle = STATUS_STYLE[selectedInquiry.status] || STATUS_STYLE.new;

        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back */}
                <button onClick={() => setSelectedInquiry(null)}
                    className="flex items-center gap-1 text-slate-500 hover:text-primary-600 mb-6 text-sm font-medium">
                    <ChevronLeft className="h-4 w-4" /> Back to Inbox
                </button>

                {/* Listing Info */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 flex items-center gap-4">
                    <img src={displayImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-grow">
                        <h3 className="font-bold text-slate-900">{listing?.title}</h3>
                        <p className="text-sm text-slate-500">{listing?.location?.town}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.color}`}>
                            {statusStyle.label}
                        </span>
                        {selectedInquiry.status !== 'closed' && tab === 'received' && (
                            <button onClick={() => handleClose(selectedInquiry._id)}
                                className="text-xs text-red-500 hover:underline font-medium flex items-center gap-1">
                                <X className="h-3 w-3" /> Close
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                        {/* Original message */}
                        <div className={`flex ${selectedInquiry.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${selectedInquiry.sender._id === user._id
                                ? 'bg-primary-500 text-white rounded-br-md'
                                : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                }`}>
                                <p className="text-sm">{selectedInquiry.message}</p>
                                <p className={`text-[10px] mt-1.5 ${selectedInquiry.sender._id === user._id ? 'text-primary-200' : 'text-slate-400'
                                    }`}>
                                    {selectedInquiry.sender.name} · {timeAgo(selectedInquiry.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Replies */}
                        {selectedInquiry.replies.map((reply, i) => {
                            const isMe = reply.sender._id === user._id;
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe
                                        ? 'bg-primary-500 text-white rounded-br-md'
                                        : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                        }`}>
                                        <p className="text-sm">{reply.message}</p>
                                        <p className={`text-[10px] mt-1.5 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                            {reply.sender.name} · {timeAgo(reply.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Reply Input */}
                    {selectedInquiry.status !== 'closed' && (
                        <div className="p-4 border-t border-slate-100 flex gap-2">
                            <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                                placeholder="Type your reply..."
                                className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                            <button
                                onClick={handleReply}
                                disabled={sending || !replyText.trim()}
                                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Send className="h-4 w-4" /> Send
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Inbox</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['received', 'sent'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setSelectedInquiry(null); }}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}>
                        {t === 'received' ? 'Received' : 'Sent'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-500">Loading...</div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No {tab} inquiries yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map(inq => {
                        const person = tab === 'received' ? inq.sender : inq.owner;
                        const listing = inq.listing;
                        const displayImage = listing?.images?.[0] || NO_IMAGE_PLACEHOLDER;
                        const statusStyle = STATUS_STYLE[inq.status] || STATUS_STYLE.new;
                        const lastMsg = inq.replies?.length > 0
                            ? inq.replies[inq.replies.length - 1].message
                            : inq.message;

                        return (
                            <button key={inq._id} onClick={() => openInquiry(inq._id)}
                                className={`w-full text-left bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow flex gap-4 items-start ${inq.status === 'new' ? 'border-l-4 border-l-primary-500' : ''
                                    }`}>
                                <img src={displayImage} alt="" className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{person?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{listing?.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.color}`}>
                                                {statusStyle.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{timeAgo(inq.updatedAt || inq.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 truncate">{lastMsg}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Inbox;
