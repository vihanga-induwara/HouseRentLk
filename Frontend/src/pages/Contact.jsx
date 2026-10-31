import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Globe, MessageSquare } from 'lucide-react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';

const Contact = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await API.post('/inquiries', {
                ...formData,
                type: 'support'
            });
            toast.success("Message sent successfully! We'll get back to you soon.");
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Get in Touch</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">
                                Let's Start a <span className="text-primary-500">Conversation</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                                Have questions about our services or need help with a listing? Our team is here to provide the support you need.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <Mail className="h-6 w-6 text-primary-500 mb-4" />
                                <h3 className="font-black text-slate-900 dark:text-white mb-1 italic">Email Us</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{settings?.contactEmail || 'info@houserent.lk'}</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <Phone className="h-6 w-6 text-primary-500 mb-4" />
                                <h3 className="font-black text-slate-900 dark:text-white mb-1 italic">Call Us</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{settings?.contactPhone || '+94 77 123 4567'}</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none sm:col-span-2">
                                <MapPin className="h-6 w-6 text-primary-500 mb-4" />
                                <h3 className="font-black text-slate-900 dark:text-white mb-1 italic">Visit Our Office</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{settings?.contactAddress || '123 Galle Road, Colombo 03, Sri Lanka'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-slate-900 rounded-[2rem] text-white">
                            <Clock className="h-6 w-6 text-primary-400 shrink-0" />
                            <div>
                                <h4 className="font-black italic text-sm">Working Hours</h4>
                                <p className="text-xs text-slate-400 font-medium">{settings?.officeHours || 'Mon - Fri: 9:00 AM - 6:00 PM'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 p-8 md:p-12 shadow-2xl shadow-slate-200/60 dark:shadow-none">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
                                <textarea
                                    rows="5"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {sending ? 'Sending...' : (
                                    <>
                                        <span>Send Message</span>
                                        <Send className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="mt-20 rounded-[4rem] overflow-hidden bg-slate-200 dark:bg-slate-800 h-[400px] relative group border border-slate-100 dark:border-slate-700">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-black italic text-lg opacity-50">
                        <MapPin className="h-12 w-12 mb-2 block mx-auto" />
                        Interactive Map View
                    </div>
                    {/* In a real scenario, we would embed a Google Map here */}
                    <div className="absolute bottom-10 left-10 p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-xs transition-transform group-hover:scale-105">
                        <h4 className="font-black italic text-slate-900 dark:text-white mb-2">HouseRentLk HQ</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Centered in the heart of Colombo, supporting house rentals across the island.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
