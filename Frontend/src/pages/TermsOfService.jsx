import { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Scale, Loader2 } from 'lucide-react';
import API from '../utils/api';

const TermsOfService = () => {
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/pages/terms-of-service');
                setPage(data);
            } catch (error) {
                console.log("No dynamic terms found, using defaults");
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
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                                {page?.title || <>Terms of <span className="text-primary-500">Service</span></>}
                            </h1>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                {page ? `Last updated: ${new Date(page.updatedAt).toLocaleDateString()}` : 'Last updated: February 24, 2026'}
                            </p>
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
                                    Welcome to HouseRentLk. Please read these terms carefully before using our platform. By accessing or using our services, you agree to be bound by these terms and all applicable laws in Sri Lanka.
                                </p>

                                <section className="mb-12">
                                    <h2 className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white mb-4 italic">
                                        <span className="p-1 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs not-italic">01</span>
                                        Acceptance of Terms
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        HouseRentLk provides a platform for listing and searching for residential properties for rent in Sri Lanka. You must be at least 18 years old to use this site. Registration is required for certain features, and you are responsible for maintaining the confidentiality of your account credentials.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white mb-4 italic">
                                        <span className="p-1 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs not-italic">02</span>
                                        Listing Guidelines
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                                        When posting a listing, you agree that:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 text-slate-500 dark:text-slate-400 font-medium">
                                        <li>The property is located in Sri Lanka.</li>
                                        <li>The information provided is accurate and not misleading.</li>
                                        <li>You have the right to rent out the property.</li>
                                        <li>Images used are authentic and represent the current state of the property.</li>
                                        <li>You will comply with the Rent Act of Sri Lanka and other relevant regulations.</li>
                                    </ul>
                                </section>

                                <section className="mb-12">
                                    <h2 className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white mb-4 italic">
                                        <span className="p-1 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs not-italic">03</span>
                                        Prohibited Activities
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        You may not use the platform for fraudulent purposes, harassing others, scraping data without permission, or posting illegal content. We reserve the right to remove any listing or suspend any account that violates these terms.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white mb-4 italic">
                                        <span className="p-1 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs not-italic">04</span>
                                        Disclaimer of Warranties
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        HouseRentLk operates as a marketplace. We do not own the properties listed and do not guarantee the completion of any transaction. We recommend all users to perform their own due diligence before making any financial commitments.
                                    </p>
                                </section>

                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic mb-0">
                                        If you have any questions about these terms, please <a href="/contact" className="text-primary-500 hover:underline">contact our legal team</a>.
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

export default TermsOfService;
