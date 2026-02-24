import React, { useState } from 'react';
import RentAffordabilityCalculator from '../components/rent-tools/RentAffordabilityCalculator';
import RentVsBuyComparison from '../components/rent-tools/RentVsBuyComparison';
import RentalDepositPlanner from '../components/rent-tools/RentalDepositPlanner';
import UtilityCostEstimator from '../components/rent-tools/UtilityCostEstimator';
import { Calculator, LayoutGrid, ArrowRight, ShieldCheck, Compass, Wallet, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const RentBudgetPlannerPage = () => {
    const [activeTab, setActiveTab] = useState('affordability');

    const tabs = [
        { id: 'affordability', label: 'Affordability', icon: Calculator, color: 'text-primary-500' },
        { id: 'deposit', label: 'Deposit Planner', icon: Wallet, color: 'text-emerald-500' },
        { id: 'comparison', label: 'Rent vs Buy', icon: LayoutGrid, color: 'text-indigo-500' },
        { id: 'utilities', label: 'Utilities', icon: Sparkles, color: 'text-amber-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full font-black text-[10px] uppercase tracking-widest mb-6">
                        <Compass className="h-4 w-4" /> Smart Renting Starts Here
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-6 leading-[0.9]">
                        Find a Home You Can <br />
                        <span className="text-primary-500">Comfortably Afford</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                        Plan your monthly budget and discover how much rent fits your income.
                        Calculate deposits, estimate utilities, and make data-driven decisions.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            <tab.icon className={`h-4 w-4 ${tab.color}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 xl:col-span-8">
                        {activeTab === 'affordability' && <RentAffordabilityCalculator />}
                        {activeTab === 'deposit' && <RentalDepositPlanner />}
                        {activeTab === 'comparison' && <RentVsBuyComparison />}
                        {activeTab === 'utilities' && <UtilityCostEstimator />}
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                            <h4 className="font-black text-slate-900 dark:text-white italic tracking-tight mb-4">Why use our tools?</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-[13px] text-slate-900 dark:text-white italic tracking-tight">Smart Budgeting</h5>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Calculate how much rent you can comfortably afford based on your income and lifestyle.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center shrink-0">
                                        <Wallet className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-[13px] text-slate-900 dark:text-white italic tracking-tight">Cost Transparency</h5>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Break down 3–6 months advance payments and refundable deposits required in Sri Lanka.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-[13px] text-slate-900 dark:text-white italic tracking-tight">Utility Estimator</h5>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Avoid surprises with AI-powered estimates for electricity and water costs.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700">
                                <Link to="/browse">
                                    <button className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-2xl active:scale-95">
                                        Browse Homes <ArrowRight className="h-5 w-5" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-20 p-12 bg-slate-900 dark:bg-slate-800 rounded-[3rem] text-center border border-slate-800">
                    <p className="text-slate-400 font-medium mb-4 italic">"Smart renting starts with smart budgeting."</p>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Your Trusted Partner in the <span className="text-primary-500">Sri Lankan Rental Market</span></h3>
                </div>
            </div>
        </div>
    );
};

export default RentBudgetPlannerPage;
