import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, CheckCircle, XCircle, Clock, Heart, X } from 'lucide-react';
import API from '../utils/api';

const TYPE_ICONS = {
    inquiry_received: { icon: MessageSquare, color: 'text-blue-500' },
    inquiry_reply: { icon: MessageSquare, color: 'text-emerald-500' },
    listing_approved: { icon: CheckCircle, color: 'text-emerald-500' },
    listing_rejected: { icon: XCircle, color: 'text-red-500' },
    listing_expiring: { icon: Clock, color: 'text-orange-500' },
    listing_favorited: { icon: Heart, color: 'text-pink-500' },
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count on mount and poll every 60 seconds while the tab is visible
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const { data } = await API.get('/notifications/unread-count');
                setUnreadCount(data.count);
            } catch {
                // Silently fail — user might not be logged in
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        document.addEventListener('visibilitychange', fetchUnreadCount);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', fetchUnreadCount);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);
        } catch {
            // Silently fail
        }
    };

    const handleOpen = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // Silently fail
        }
    };

    const handleClickNotification = async (notification) => {
        if (!notification.read) {
            try {
                await API.put(`/notifications/${notification._id}/read`);
                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {
                // Silently fail
            }
        }
        setIsOpen(false);
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                aria-label="Notifications"
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-primary-600 font-semibold hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.inquiry_received;
                                const Icon = typeConfig.icon;
                                return (
                                    <Link
                                        key={n._id}
                                        to={n.link || '#'}
                                        onClick={() => handleClickNotification(n)}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${!n.read ? 'bg-primary-50/40' : ''
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 mt-0.5 ${typeConfig.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.read && (
                                            <div className="flex-shrink-0 mt-1.5">
                                                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
