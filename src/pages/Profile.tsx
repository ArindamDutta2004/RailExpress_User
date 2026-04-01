import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI } from '../services/api';

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError('Both fields are required');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await accountAPI.changePassword({ oldPassword, newPassword });
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg p-6">
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={avatarUrl(user?.email || 'user')} className="w-16 h-16 rounded-full" alt="avatar" />
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-white/70">{user?.name} ({user?.email})</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/90"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/90"
            />
          </div>
          {error && <div className="text-red-200 text-sm">{error}</div>}
          {message && <div className="text-green-200 text-sm">{message}</div>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
              onClick={() => navigate('/dashboard')}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

