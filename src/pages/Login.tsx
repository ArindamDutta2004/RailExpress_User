import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, feedbackAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Brain as Train, MessageSquare, Star } from 'lucide-react';

type PublicFeedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  phone: string;
  createdAt: string;
};

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [publicFeedbacks, setPublicFeedbacks] = useState<PublicFeedback[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [publicError, setPublicError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      login(token, user);

      const termsAccepted = localStorage.getItem('termsAccepted');
      if (termsAccepted === 'true') {
        navigate('/dashboard');
      } else {
        navigate('/terms');
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setPublicLoading(true);
        setPublicError('');
        const res = await feedbackAPI.publicList();
        setPublicFeedbacks((res.data || []).slice(0, 4));
      } catch (err) {
        setPublicError('Failed to load public feedback');
      } finally {
        setPublicLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen animated-bg page p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <div className="glass-card hover-glow rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-sky-200" />
            <h3 className="text-lg font-bold">Recent Public Feedback</h3>
          </div>
          <p className="text-white/70 text-sm mb-4">
            Real reviews from customers (phone numbers are masked).
          </p>

          {publicLoading ? (
            <div className="text-white/70 text-sm">
              Loading feedback…
            </div>
          ) : publicError ? (
            <div className="text-red-200 text-sm">{publicError}</div>
          ) : publicFeedbacks.length === 0 ? (
            <div className="text-white/70 text-sm">No feedback yet.</div>
          ) : (
            <div className="space-y-3">
              {publicFeedbacks.map((f, idx) => {
                const short =
                  f.comment && f.comment.length > 140 ? `${f.comment.slice(0, 140)}...` : f.comment;
                return (
                  <div
                    key={f.id}
                    className="bg-white/10 ring-1 ring-white/15 rounded-xl p-4 hover-glow press"
                    style={{ animationDelay: `${60 + idx * 70}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl((f.userName || 'user') + (f.phone || ''))}
                          alt="avatar"
                          className="w-9 h-9 rounded-full bg-white/10"
                        />
                        <div>
                          <div className="text-sm font-semibold">{f.userName || 'User'}</div>
                          <div className="text-xs text-white/60">
                            {f.phone} • {new Date(f.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-yellow-200 font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {f.rating ?? '-'}
                      </div>
                    </div>
                    <div className="text-white/85 text-sm mt-2 whitespace-pre-wrap">{short}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Train className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
          <p className="text-center text-white/80 mb-8">Login to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 bg-white/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 bg-white/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-sky-200 hover:text-sky-100 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
