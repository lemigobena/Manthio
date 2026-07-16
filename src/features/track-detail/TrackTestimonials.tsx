import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { useNotifications } from '../../context/NotificationContext';
import { hashNum, LEARNER_AVATARS } from '../../components/social/socialUtils';
import type { Review } from '../../types';

// Deterministic mock testimonials so every track has social proof without a backend.
const SEED_AUTHORS = ['Lena K.', 'Marco T.', 'Priya S.', 'Jonas W.', 'Aisha B.', 'Tom R.'];
const SEED_COMMENTS = [
  'This track gave me a clear roadmap — no more guessing what to learn next.',
  'The course order makes so much sense. Each milestone builds on the last.',
  'Finished the whole path and landed a new role two months later.',
  'Great mix of theory and hands-on projects across the courses.',
  'The milestone structure kept me motivated all the way through.',
  'Best structured learning path I have followed so far.',
];

const getSeededReviews = (trackId: string): Review[] => {
  const count = hashNum(trackId + '-review-count', 3, 5);
  const offset = hashNum(trackId, 0, SEED_COMMENTS.length - 1);
  return Array.from({ length: count }, (_, i) => ({
    id: `seed-${trackId}-${i}`,
    userName: SEED_AUTHORS[(offset + i) % SEED_AUTHORS.length],
    userAvatar: LEARNER_AVATARS[(offset + i) % LEARNER_AVATARS.length],
    rating: hashNum(trackId + '-stars' + i, 4, 5),
    comment: SEED_COMMENTS[(offset + i) % SEED_COMMENTS.length],
    date: new Date(Date.now() - hashNum(trackId + i, 5, 90) * 86400000).toISOString(),
    isVerified: true,
    helpfulCount: hashNum(trackId + '-helpful' + i, 0, 24),
  }));
};

interface TrackTestimonialsProps {
  trackId: string;
  trackTitle: string;
}

export const TrackTestimonials: React.FC<TrackTestimonialsProps> = ({ trackId, trackTitle }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast, addXp } = useXP();
  const { addNotification } = useNotifications();

  const [visibleReviews, setVisibleReviews] = useState(3);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [myReviews, setMyReviews] = useState<Review[]>([]);

  const seededReviews = getSeededReviews(trackId);
  const rating = (hashNum(trackId + '-rating', 44, 49) / 10).toFixed(1);
  const ratingCount = hashNum(trackId + '-rating-count', 30, 180);

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewText.trim()) {
      addToast('error', 'Please add a star rating and a short review before submitting.');
      return;
    }
    const newReview: Review = {
      id: `my-review-${myReviews.length}-${reviewText.length}`,
      userName: user?.name || 'You',
      userAvatar: user?.avatar,
      rating: reviewRating,
      comment: reviewText.trim(),
      date: new Date(Date.now()).toISOString(),
      isVerified: true,
      helpfulCount: 0,
    };
    setMyReviews(prev => [newReview, ...prev]);
    setReviewRating(0);
    setHoverRating(0);
    setReviewText('');
    setShowReviewForm(false);
    addXp(75, 'Shared a track review');
    addNotification({
      category: 'social',
      title: '🎉 Thanks! Your testimonial has been posted.',
      message: `Your ${reviewRating}-star review of ${trackTitle} is now live for other learners to see.`,
      critical: false,
    });
  };

  const allReviews = [...myReviews, ...seededReviews];

  return (
    <div className="py-8 border-t border-line space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl shrink-0 bg-orange/10">
            <Star className="w-5 h-5 text-orange fill-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text tracking-tight">Reviews & Testimonials</h2>
            <p className="text-xs text-muted font-medium mt-0.5">What learners say about this track</p>
          </div>
        </div>
        {!showReviewForm && (
          <button
            onClick={() => (isAuthenticated ? setShowReviewForm(true) : addToast('info', 'Sign in to write a review.'))}
            className="shrink-0 flex items-center gap-2 bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 px-4 py-2 rounded-xl transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write a review</span>
            <span className="sm:hidden">Review</span>
          </button>
        )}
      </div>

      {/* Rate + submit testimonial form */}
      {showReviewForm && (
        <div className="bg-bg/40 border border-cyan/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || LEARNER_AVATARS[0]}
              alt={user?.name || 'You'}
              className="w-10 h-10 rounded-full border border-line object-cover"
            />
            <div>
              <h4 className="font-bold text-sm text-text">{user?.name || 'You'}</h4>
              <p className="text-[10px] text-muted">Share your experience with this track</p>
            </div>
          </div>

          {/* Interactive star rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star className={`w-6 h-6 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-orange fill-orange' : 'text-line'}`} />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-muted">
              {(hoverRating || reviewRating) > 0
                ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || reviewRating]
                : 'Tap to rate'}
            </span>
          </div>

          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What did you enjoy? What could be better? Your honest feedback helps other learners."
            className="w-full bg-panel border border-line rounded-xl p-3 text-sm text-text placeholder:text-muted/60 !outline-none resize-none focus:outline-none focus:border-cyan/50 transition-colors"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-muted font-medium">{reviewText.length}/500</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowReviewForm(false); setReviewRating(0); setHoverRating(0); setReviewText(''); }}
                className="text-xs font-bold text-muted hover:text-text px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="bg-cyan hover:bg-cyan/90 text-bg font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)] cursor-pointer"
              >
                Post Review
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-line">
        {/* Rating Summary */}
        <div className="space-y-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-text">{rating}</span>
            <span className="text-muted font-bold text-sm">/ 5.0</span>
          </div>
          <div className="flex text-orange">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(rating)) ? 'fill-orange' : 'opacity-20'}`} />
            ))}
          </div>
          <p className="text-xs text-muted font-medium">Based on {ratingCount} verified reviews</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const percentage = star === 5 ? 85 : star === 4 ? 12 : 1;
            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <span className="w-12 text-muted font-bold">{star} Stars</span>
                <div className="flex-1 h-1.5 bg-bg border border-line rounded-full overflow-hidden">
                  <div className="h-full bg-orange rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-8 text-right text-muted font-bold">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {allReviews.slice(0, visibleReviews + myReviews.length).map(review => {
          const isMine = myReviews.some(r => r.id === review.id);
          return (
            <div key={review.id} className={`space-y-4 py-6 border-b border-line last:border-0 last:pb-0 ${isMine ? 'bg-cyan/[0.04] -mx-3 px-3 rounded-xl border-b-0 pb-4' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.userAvatar || LEARNER_AVATARS[0]}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full border border-line object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-text flex items-center gap-2">
                      {review.userName}
                      {isMine && <span className="text-[9px] bg-cyan/15 text-cyan px-1.5 py-0.5 rounded font-black tracking-wider">Your review</span>}
                    </h4>
                    <p className="text-[10px] text-muted">{new Date(review.date).toLocaleDateString()} • Learner</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-cyan fill-cyan' : 'text-line'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed font-medium">"{review.comment}"</p>
            </div>
          );
        })}

        {visibleReviews < seededReviews.length && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setVisibleReviews(prev => prev + 3)}
              className="text-xs font-bold uppercase tracking-widest text-cyan hover:text-cyan/80 transition-colors cursor-pointer"
            >
              Show More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
