import { useEffect, useMemo, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { feedbackAPI } from '../services/api';

interface FeedbackSectionProps {
  bookingId: string;
  onFeedbackSuccess: () => void;
  phone?: string;
  alreadySubmitted?: boolean;
}

const QUICK_COMMENTS = [
  'Fast and helpful service.',
  'Good experience, recommended.',
  'Great support from the booking team.',
  'Smooth process and quick updates.',
  'Needs improvement in response time.',
];

const FeedbackSection = ({ bookingId, onFeedbackSuccess, phone, alreadySubmitted = false }: FeedbackSectionProps) => {
  const localStorageKey = useMemo(() => `feedbackSubmitted:${bookingId}`, [bookingId]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  useEffect(() => {
    if (alreadySubmitted) {
      setSubmitted(true);
      setSuccess('Feedback already submitted for this booking');
      try {
        localStorage.setItem(localStorageKey, 'true');
      } catch (_err) {
        // Ignore localStorage errors.
      }
      return;
    }
    try {
      const localSubmitted = localStorage.getItem(localStorageKey) === 'true';
      if (localSubmitted) {
        setSubmitted(true);
        setSuccess('Feedback already submitted for this booking');
      }
    } catch (_err) {
      // Ignore localStorage errors.
    }
  }, [alreadySubmitted, localStorageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || submitted) return;

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await feedbackAPI.create({
        bookingId,
        phone: phoneNumber,
        rating,
        comment: comment.trim(),
      });

      setSuccess('Thank you for your feedback!');
      setSubmitted(true);
      try {
        localStorage.setItem(localStorageKey, 'true');
      } catch (_err) {
        // Ignore localStorage errors.
      }

      setTimeout(() => {
        onFeedbackSuccess();
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit feedback';
      const normalized = String(errorMessage).toLowerCase();
      if (normalized.includes('already submitted')) {
        setSubmitted(true);
        setSuccess('Feedback already submitted for this booking');
        setError('');
        try {
          localStorage.setItem(localStorageKey, 'true');
        } catch (_err) {
          // Ignore localStorage errors.
        }
        onFeedbackSuccess();
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted && success) {
    return (
      <div className="bg-green-50/90 border border-green-200 rounded-xl p-4">
        <div className="text-center text-green-700">
          <MessageSquare className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/85 border border-white/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-slate-900">Share Your Feedback</h4>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError('');
            }}
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="10 digit phone number"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Your Experience
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setError('');
                }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={loading}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Your Comments
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_COMMENTS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={loading}
                onClick={() => {
                  setComment(c);
                  setError('');
                }}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError('');
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Share your experience with us..."
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackSection;
