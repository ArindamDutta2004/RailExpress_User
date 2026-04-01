import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../services/api';
import { MessageSquare, Star, ShieldCheck, Ticket, Sparkles } from 'lucide-react';

type PublicFeedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  phone: string;
  createdAt: string;
};

const UNSPLASH_BG =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80";

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

export default function PublicDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState<PublicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const count = feedbacks.length;
    const avg =
      count === 0 ? 0 : feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / count;
    return { count, avg: Number(avg.toFixed(1)) };
  }, [feedbacks]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await feedbackAPI.publicList();
        setFeedbacks(res.data || []);
        setError('');
      } catch {
        setError('Failed to load public feedback');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div
      className="min-h-screen page"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.85), rgba(30,41,59,0.65)), url(${UNSPLASH_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-end items-center gap-3 mb-6">
          {isAuthenticated ? (
            <>
              <span className="text-white text-sm">Welcome, {user?.name || 'User'}</span>
              <Link
                to="/dashboard"
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                My Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-blue-200 hover:text-white border border-blue-200 hover:border-white px-3 py-1.5 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-gray-200 px-3 py-1.5 rounded-md text-sm"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 ring-1 ring-white/15">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Railway Ticket Booking Agent System
            </h1>
            <p className="text-white/70 mt-1">
              Real feedback, transparent process, and verified confirmations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <ShieldCheck className="w-5 h-5" />
              Why use this service?
            </div>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• Agent-assisted booking with step-by-step tracking</li>
              <li>• Manual verification for payments (safer)</li>
              <li>• PDFs (ticket/bill) shared only after completion</li>
              <li>• One feedback per booking (genuine reviews)</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <Sparkles className="w-5 h-5" />
              Public stats
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/70 text-sm">Feedback count</div>
                <div className="text-white text-3xl font-extrabold">{stats.count}</div>
              </div>
              <div className="text-right">
                <div className="text-white/70 text-sm">Average rating</div>
                <div className="text-white text-3xl font-extrabold flex items-center gap-2 justify-end">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  {stats.avg}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <MessageSquare className="w-5 h-5" />
              Before you login
            </div>
            <p className="text-white/80 text-sm">
              Anyone can view public feedback (phone numbers are masked). Login is required only to
              create bookings and submit feedback for your booking.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Public Feedback</h2>
            <span className="text-white/70 text-sm">Phone numbers are masked</span>
          </div>

          {loading ? (
            <div className="text-white/80 py-10 text-center">Loading feedback…</div>
          ) : error ? (
            <div className="text-red-200 py-10 text-center">{error}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-white/70 py-10 text-center">No feedback yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f, idx) => (
                <div
                  key={f.id}
                  className="bg-white/10 rounded-2xl p-5 ring-1 ring-white/10 hover:ring-white/20 transition stagger-item"
                  style={{ animationDelay: `${300 + Math.min(idx, 10) * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={avatarUrl((f.userName || 'user') + (f.phone || ''))}
                      className="w-10 h-10 rounded-full bg-white/10"
                      alt="avatar"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold">{f.userName || 'User'}</div>
                        <div className="text-yellow-300 font-semibold flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {f.rating}
                        </div>
                      </div>
                      <div className="text-white/60 text-xs mt-0.5">
                        {f.phone} • {new Date(f.createdAt).toLocaleString()}
                      </div>
                      <div className="text-white/85 text-sm mt-3 whitespace-pre-wrap">{f.comment}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

