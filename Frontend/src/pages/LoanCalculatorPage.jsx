import React from 'react';
import LoanCalculator from '../components/LoanCalculator';
import { Landmark, ArrowRight, ShieldCheck, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoanCalculatorPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full font-black text-[10px] uppercase tracking-widest mb-6">
                            <Landmark className="h-4 w-4" /> Financial Planning Tools
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-6 leading-[0.9]">
                            Buy Your Own <br />
                            <span className="text-primary-500">Dream Home</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-lg mb-10 leading-relaxed">
                            Compare rent vs. mortgage and plan your future with our smart loan calculator tailored for the Sri Lankan real estate market.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white italic tracking-tight">Accurate Market Rates</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Updated based on the latest Central Bank of Sri Lanka lending rates.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg shrink-0">
                                    <PieChart className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white italic tracking-tight">Interest Breakdown</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">See exactly how much interest you'll pay over the loan tenure.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <Link to="/browse">
                                <button className="inline-flex items-center gap-3 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-2xl active:scale-95">
                                    Browse Available Houses <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/5 blur-[120px] rounded-full"></div>
                        <LoanCalculator />
                    </div>
                </div>

                <div className="mt-20 p-12 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 text-center">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">Partner <span className="text-primary-500">Banks</span></h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Get exclusive housing loan rates with HouseRentLk partner banking institutions.</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for bank logos */}
                        <div className="font-black text-xl italic tracking-tighter text-slate-400">COMMERCIAL BANK</div>
                        <div className="font-black text-xl italic tracking-tighter text-slate-400">HNB BANK</div>
                        <div className="font-black text-xl italic tracking-tighter text-slate-400">SAMPATH BANK</div>
                        <div className="font-black text-xl italic tracking-tighter text-slate-400">PEOPLE'S BANK</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanCalculatorPage;
