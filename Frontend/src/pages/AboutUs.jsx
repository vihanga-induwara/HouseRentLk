import { useState, useEffect } from 'react';
import { Users, Target, Rocket, Heart, Award, Loader2 } from 'lucide-react';
import API from '../utils/api';

const AboutUs = () => {
    const [page, setPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/pages/about-us');
                setPage(data);
            } catch (error) {
                console.log("No dynamic about us found, using defaults");
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
            <div className="max-w-7xl mx-auto px-4">
                {/* Hero Section */}
                <div className="relative rounded-[4rem] overflow-hidden bg-slate-900 h-[500px] flex items-center justify-center text-center p-8 mb-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>

                    <div className="relative z-10 max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-6">
                            {page?.title || <>Redefining <span className="text-primary-500">Rentals</span> in Sri Lanka</>}
                        </h1>
                        <p className="text-xl text-slate-300 font-medium leading-relaxed italic">
                            {page?.content || "We are on a mission to bring cost transparency, security, and AI-driven intelligence to the island's housing market."}
                        </p>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Target className="h-32 w-32 text-primary-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight mb-6">Our <span className="text-primary-500">Mission</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">
                            To empower Sri Lankan families and professionals with the most reliable, verified, and technologically advanced platform for finding their next home. We eliminate the guesswork from renting.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Rocket className="h-32 w-32 text-primary-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight mb-6">Our <span className="text-primary-500">Vision</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">
                            To become the undisputed ecosystem for the rental economy in Sri Lanka, where every tenancy begins with trust and every data point builds a better community.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tight mb-4">Values that <span className="text-primary-500">Drive</span> Us</h2>
                        <div className="h-1.5 w-24 bg-primary-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: ShieldCheck, title: "Uncompromising Integrity", desc: "Verification is at the heart of everything we do." },
                            { icon: Heart, title: "Customer Obsession", desc: "We build for the renter, the owner, and the broker." },
                            { icon: Award, title: "Excellence in Innovation", desc: "Leading the market with AI and smart financial tools." }
                        ].map((v, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-all text-center group">
                                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <v.icon className="h-8 w-8" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 italic">{v.title}</h4>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-primary-500 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -mr-48 -mb-48"></div>

                    <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">5,000+</div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary-100">Active Listings</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">12,000+</div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary-100">Happy Families</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">250+</div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary-100">Verified Brokers</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">100%</div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary-100">Local Team</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShieldCheck = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

export default AboutUs;
