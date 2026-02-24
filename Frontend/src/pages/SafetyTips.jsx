import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';
import API from '../utils/api';

const SafetyTips = () => {
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/pages/safety-tips');
                setPage(data);
            } catch (error) {
                console.log("No dynamic safety tips found, using defaults");
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
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 mb-4">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Smart Renting</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">
                        {page?.title || <>Safety <span className="text-primary-500">Tips</span></>}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Your safety is paramount. Follow these guidelines to ensure a secure rental experience in Sri Lanka.
                    </p>
                </div>

                {page?.content ? (
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none mb-12">
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                            {page.content}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 font-black text-xl italic">
                                    DOs
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Always visit the property in person before paying.",
                                        "Meet the owner or authorized broker at the property.",
                                        "Ask for a copy of the NIC of the owner/broker.",
                                        "Ensure a legal tenancy agreement is signed.",
                                        "Pay via bank transfer for clear record-keeping.",
                                        "Verify utility bill history to avoid hidden debts."
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 mb-6 font-black text-xl italic">
                                    DON'Ts
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Never transfer money without seeing the house.",
                                        "Don't share sensitive OTPs or bank credentials.",
                                        "Avoid deals that seem 'too good to be true'.",
                                        "Don't pay 'viewing fees' just to see a house.",
                                        "Avoid cash payments for large deposits.",
                                        "Don't ignore red flags in owner's behavior."
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-3">
                                            <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 rounded-[2.5rem] p-8 md:p-12 mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Common Scams to Watch Out For</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                    <h4 className="font-black text-slate-900 dark:text-white mb-2 italic underline decoration-amber-500 underline-offset-4">The 'Urgent Deposit' Scam</h4>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                                        Scammers often claim they are abroad or Busy and demand an immediate deposit to "hold the house" for you. They may use stolen photos from other sites.
                                    </p>
                                </div>
                                <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                    <h4 className="font-black text-slate-900 dark:text-white mb-2 italic underline decoration-amber-500 underline-offset-4">The Fake Owner</h4>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                                        Someone who has keys (e.g., a former tenant or caretaker) pretends to be the owner and collects deposits from multiple people simultaneously.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="text-center">
                    <p className="text-slate-500 font-bold mb-6 italic">If you encounter any suspicious activity on our platform, please report it immediately.</p>
                    <a href="/contact" className="inline-flex items-center gap-2 py-3 px-8 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-black active:scale-95">
                        <Info className="h-4 w-4" />
                        Report a Scam
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SafetyTips;
