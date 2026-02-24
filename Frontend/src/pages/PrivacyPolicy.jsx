import { useState, useEffect } from 'react';
import { Shield, Eye, Lock, FileCheck, Loader2 } from 'lucide-react';
import API from '../utils/api';

const PrivacyPolicy = () => {
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/pages/privacy-policy');
                setPage(data);
            } catch (error) {
                console.log("No dynamic privacy policy found, using defaults");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPage();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </div>
        );
    }
    return (
        <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 p-8 md:p-16 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                                {page?.title || <>Privacy <span className="text-primary-500">Policy</span></>}
                            </h1>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Your privacy is our priority</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        {page?.content ? (
                            <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                {page.content}
                            </div>
                        ) : (
                            <>
                                <p className="text-lg font-bold text-slate-600 dark:text-slate-300 italic mb-10 leading-relaxed">
                                    At HouseRentLk, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data in accordance with Sri Lanka's Personal Data Protection Act.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                        <Eye className="h-6 w-6 text-primary-500 mb-4" />
                                        <h3 className="font-black text-slate-900 dark:text-white mb-2 italic">Data Collection</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                            We collect information you provide directly to us, such as your name, email, phone number, and property details when you register or post a listing.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                        <Lock className="h-6 w-6 text-primary-500 mb-4" />
                                        <h3 className="font-black text-slate-900 dark:text-white mb-2 italic">Data Security</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                            We use industry-standard encryption and security measures to protect your data from unauthorized access, disclosure, or alteration.
                                        </p>
                                    </div>
                                </div>

                                <section className="mb-12">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 italic">How We Use Your Information</h2>
                                    <ul className="space-y-4">
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                                <FileCheck className="h-3 w-3 text-primary-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">To provide and maintain our platform, including property matchmaking.</p>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                                <FileCheck className="h-3 w-3 text-primary-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">To facilitate communication between renters, owners, and brokers.</p>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                                <FileCheck className="h-3 w-3 text-primary-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">To send you important notifications and updates about your account.</p>
                                        </li>
                                    </ul>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 italic">Third-Party Sharing</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        We do not sell your personal data. We only share information with third parties (like cloud storage or map services) necessary for platform operation, or when required by law.
                                    </p>
                                </section>

                                <div className="p-8 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] border border-primary-100 dark:border-primary-900/20">
                                    <h3 className="text-lg font-black text-primary-700 dark:text-primary-300 mb-2 italic">Your Rights</h3>
                                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 leading-relaxed mb-0">
                                        You have the right to access, correct, or delete your personal data at any time. You can do this through your account settings or by contacting our support team.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
