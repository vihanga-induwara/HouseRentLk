import React, { useState, useEffect } from 'react';
import { Calculator, Landmark, Info, ArrowRight } from 'lucide-react';

const LoanCalculator = ({ defaultAmount = 5000000 }) => {
    const [amount, setAmount] = useState(defaultAmount);
    const [interest, setInterest] = useState(14.5);
    const [years, setYears] = useState(20);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);

    useEffect(() => {
        const calculateEMI = () => {
            const r = interest / 12 / 100;
            const n = years * 12;
            const emiCalc = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

            if (isNaN(emiCalc) || !isFinite(emiCalc)) {
                setEmi(0);
                setTotalInterest(0);
                setTotalPayment(0);
                return;
            }

            const totalPay = emiCalc * n;
            setEmi(Math.round(emiCalc));
            setTotalPayment(Math.round(totalPay));
            setTotalInterest(Math.round(totalPay - amount));
        };
        calculateEMI();
    }, [amount, interest, years]);

    const formatLKR = (val) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl">
                    <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Loan <span className="text-primary-500">Calculator</span></h3>
            </div>

            <div className="space-y-6 mb-10">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Loan Amount (LKR)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Min: 1M</span>
                        <span>{formatLKR(amount)}</span>
                        <span>Max: 100M</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Interest Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={interest}
                            onChange={(e) => setInterest(Number(e.target.value))}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Period (Years)</label>
                        <input
                            type="number"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="p-6 bg-slate-900 dark:bg-slate-700 rounded-[2rem] text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Monthly Repayment (EMI)</div>
                    <div className="text-4xl font-black italic tracking-tighter text-primary-400">{formatLKR(emi)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Interest</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white italic">{formatLKR(totalInterest)}</div>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payment</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white italic">{formatLKR(totalPayment)}</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300 leading-relaxed italic">
                    Calculations are based on the reducing balance method. Interest rates may vary by bank (current SL average: 13-16%).
                </p>
            </div>
        </div>
    );
};

export default LoanCalculator;
