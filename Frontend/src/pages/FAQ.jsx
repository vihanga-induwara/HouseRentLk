import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import API from '../utils/api';

const defaultFaqData = [
    {
        category: "General",
        items: [
            {
                question: "What is HouseRentLk?",
                answer: "HouseRentLk is Sri Lanka's leading house rental portal, connecting owners, renters, and verified brokers. We focus exclusively on house rentals to provide a specialized experience."
            },
            {
                question: "Is it free to use?",
                answer: "Yes, browsing listings and using our budget tools is completely free. Owners and brokers can also post ads for free, with premium featured options available."
            }
        ]
    },
    {
        category: "For Renters",
        items: [
            {
                question: "How do I contact an owner?",
                answer: "You can use the 'Contact Owner' button on any listing page. If the owner has provided a phone number, it will be visible to logged-in users."
            },
            {
                question: "Are the listings verified?",
                answer: "We strive to verify all listings. Brokers are manually verified by our team, and listings with a 'Verified' badge have undergone additional checks."
            }
        ]
    },
    {
        category: "For Owners",
        items: [
            {
                question: "How long does it take for my ad to go live?",
                answer: "Ads are usually reviewed and approved within 2-6 hours during business hours."
            },
            {
                question: "How do I manage my listings?",
                answer: "You can manage your listings from your 'Dashboard' once you log in. You can edit, deactivate, or mark them as 'Rented'."
            }
        ]
    }
];

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(null);
    const [faqData, setFaqData] = useState(defaultFaqData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const { data } = await API.get('/pages/faq');
                if (data.content) {
                    try {
                        const parsed = JSON.parse(data.content);
                        if (Array.isArray(parsed)) setFaqData(parsed);
                    } catch {
                        // If not JSON, we could handle it differently, but for now just use defaults
                        console.log("FAQ content is not JSON, sticking to defaults");
                    }
                }
            } catch {
                console.log("No dynamic FAQ found, using defaults");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFaq();
    }, []);

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaq = faqData.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

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
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Help Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">
                        Frequently Asked <span className="text-primary-500">Questions</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Everything you need to know about renting and listing on HouseRentLk.
                    </p>
                </div>

                <div className="relative mb-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 outline-none transition-all shadow-xl shadow-slate-200/50 dark:shadow-none font-bold text-slate-900 dark:text-white"
                    />
                </div>

                <div className="space-y-10">
                    {filteredFaq.map((category, catIdx) => (
                        <div key={catIdx}>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 pl-4">{category.category}</h2>
                            <div className="space-y-4">
                                {category.items.map((item, itemIdx) => {
                                    const globalIdx = `${catIdx}-${itemIdx}`;
                                    const isOpen = openIndex === globalIdx;

                                    return (
                                        <div key={itemIdx} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
                                            <button
                                                onClick={() => toggleOpen(globalIdx)}
                                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                            >
                                                <span className="font-bold text-slate-900 dark:text-white transition-colors group-hover:text-primary-500">
                                                    {item.question}
                                                </span>
                                                {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                                            </button>
                                            <div className={`px-6 transition-all duration-300 ${isOpen ? 'pb-6 opacity-100 max-h-96' : 'max-h-0 opacity-0'}`}>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredFaq.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold italic">No questions found matching your search.</p>
                        </div>
                    )}
                </div>

                <div className="mt-20 p-10 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <h3 className="text-2xl font-black italic tracking-tight mb-4">Still have questions?</h3>
                    <p className="text-slate-400 max-w-lg mx-auto mb-8 font-medium">
                        Our support team is here to help you 24/7. Reach out to us anytime.
                    </p>
                    <a href="/contact" className="inline-flex py-4 px-10 bg-primary-500 hover:bg-primary-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-500/25 active:scale-95">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
