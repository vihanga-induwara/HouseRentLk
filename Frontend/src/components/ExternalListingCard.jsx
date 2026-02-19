import { ExternalLink, Star, Shield, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import API from '../utils/api';
import { useState } from 'react';

const ExternalListingCard = ({ listing }) => {
    const [clicked, setClicked] = useState(false);

    const handleClickThrough = async () => {
        if (!clicked) {
            setClicked(true);
            try {
                await API.post(`/scraping/external-listings/${listing._id}/click`);
            } catch (e) { /* silent */ }
        }
        window.open(listing.sourceUrl, '_blank');
    };

    const getPriceColor = (rating) => {
        switch (rating) {
            case 'Below Market': return 'text-green-600';
            case 'Above Market': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    const getPriceIcon = (rating) => {
        switch (rating) {
            case 'Below Market': return <TrendingDown className="h-3 w-3" />;
            case 'Above Market': return <TrendingUp className="h-3 w-3" />;
            default: return <Minus className="h-3 w-3" />;
        }
    };

    const qualityScore = listing.aiAnalysis?.qualityScore || 0;
    const priceRating = listing.aiAnalysis?.priceRating || 'Unknown';
    const scamRisk = listing.aiAnalysis?.scamRiskScore || 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
            {/* External Badge */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">🌐 External Listing</span>
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">{listing.sourceWebsite}</span>
                </div>
                <button onClick={handleClickThrough}
                    className="flex items-center gap-1 text-white/80 hover:text-white text-[10px] font-medium transition-colors">
                    View Original <ExternalLink className="h-3 w-3" />
                </button>
            </div>

            <div className="flex">
                {/* Image */}
                {listing.images?.[0] && (
                    <div className="w-40 h-40 flex-shrink-0">
                        <img src={listing.images[0]} alt={listing.title}
                            className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">
                        {listing.title}
                    </h3>

                    {listing.price > 0 && (
                        <p className="text-lg font-bold text-primary-600 mb-2">LKR {listing.price.toLocaleString()}/mo</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        {listing.location?.town && <span>📍 {listing.location.town}</span>}
                        {listing.beds > 0 && <span>🛏️ {listing.beds}</span>}
                        {listing.baths > 0 && <span>🚿 {listing.baths}</span>}
                        {listing.size > 0 && <span>📐 {listing.size} sqft</span>}
                    </div>

                    {listing.descriptionSnippet && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{listing.descriptionSnippet}</p>
                    )}

                    {/* AI Insights Strip */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Price Rating */}
                        <span className={`flex items-center gap-1 text-xs font-medium ${getPriceColor(priceRating)}`}>
                            {getPriceIcon(priceRating)} {priceRating}
                        </span>

                        {/* Quality */}
                        {qualityScore > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Star className="h-3 w-3 text-yellow-500" /> {qualityScore}/100
                            </span>
                        )}

                        {/* Safety */}
                        <span className={`flex items-center gap-1 text-xs ${scamRisk >= 50 ? 'text-red-500' :
                                scamRisk >= 25 ? 'text-yellow-500' :
                                    'text-green-500'
                            }`}>
                            <Shield className="h-3 w-3" />
                            {scamRisk >= 50 ? 'Caution' : scamRisk >= 25 ? 'Check' : 'Safe'}
                        </span>

                        {/* Comparison Insight */}
                        {listing.aiAnalysis?.comparisonToLocal && (
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">{listing.aiAnalysis.comparisonToLocal}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalListingCard;
