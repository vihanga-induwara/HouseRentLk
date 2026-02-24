import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import Button from '../Button';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';

const ListingReviews = ({ reviews, user, listingId, onReviewAdded, reviewSentiment }) => {
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    const avgRating = reviews.length > 0
        ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
        : 0;

    const getSentimentForReview = (reviewId) => {
        if (!reviewSentiment || !reviewSentiment.reviewSentiments) return null;
        return reviewSentiment.reviewSentiments.find(s => s.reviewId === reviewId);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login to leave a review'); return; }
        if (!newReview.comment.trim()) { toast.error('Please write a comment'); return; }
        setSubmittingReview(true);
        try {
            const { data } = await API.post('/reviews', {
                listingId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            onReviewAdded(data);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="pt-16 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">
                    Community <span className="text-primary-600">Voice</span> ({reviews.length})
                </h2>
                {avgRating > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < avgRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                            ))}
                        </div>
                        <span className="text-sm font-black text-slate-600 dark:text-slate-300">{avgRating.toFixed(1)} / 5</span>
                    </div>
                )}
            </div>

            {/* Write a Review */}
            {user && (
                <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-10">
                    <h4 className="font-black text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-widest">Leave a Review</h4>
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Rate ${i} stars`}
                                onClick={() => setNewReview(prev => ({ ...prev, rating: i }))}
                            >
                                <Star className={`h-6 w-6 cursor-pointer transition-colors ${i <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600 hover:text-amber-300'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-medium text-sm resize-none focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                    />
                    <Button type="submit" isLoading={submittingReview} className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3">
                        Submit Review
                    </Button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.length === 0 ? (
                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 italic font-black uppercase tracking-widest text-xs">Be the first to share your thoughts</p>
                    </div>
                ) : (
                    reviews.map(r => {
                        const sentiment = getSentimentForReview(r._id);
                        // Fallback to rating-based label if AI sentiment is not available
                        const label = sentiment ? sentiment.label : (r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral');

                        return (
                            <div key={r._id} className="p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/30 group hover:translate-y-[-4px] transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-sm font-black text-white italic">
                                            {r.reviewer?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-black text-slate-900 dark:text-white text-lg italic tracking-tight">{r.reviewer?.name}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />)}
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic">&ldquo;{r.comment}&rdquo;</p>
                                {/* Sentiment indicator */}
                                {label === 'positive' ? (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                                        <ThumbsUp className="h-3 w-3" /> Positive {sentiment && `(${sentiment.score}%)`}
                                    </div>
                                ) : label === 'negative' ? (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest">
                                        <ThumbsDown className="h-3 w-3" /> Critical {sentiment && `(${100 - sentiment.score}%)`}
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Minus className="h-3 w-3" /> Mixed
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ListingReviews;
