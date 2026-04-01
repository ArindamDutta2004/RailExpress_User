import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import BookingForm from '../components/BookingForm';
import BookingCard from '../components/BookingCard';
import { LogOut, Ticket, RefreshCw, UserCircle } from 'lucide-react';

interface Booking {
  _id: string;
  fromStation: string;
  toStation: string;
  journeyDate: string;
  passengerName: string;
  dateOfBirth: string;
  bookingType: 'tatkal' | 'reservation';
  age: number;
  phone: string;
  statusPhase1: string;
  statusPhase2: string;
  paymentStatus: string;
  currentStep: number;
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  advanceQR?: string;
  finalQR?: string;
  ticketPDF?: string;
  billPDF?: string;
  createdAt: string;
}

const Dashboard = () => {
  const avatarUrl = (seed: string) =>
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [bookingFormDisabled, setBookingFormDisabled] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await bookingAPI.getUserBookings(user.id);
      const bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      setBookings(bookingsData);

      const hasPendingBooking = bookingsData.some(
        (booking: Booking) => booking.currentStep < 3
      );
      setBookingFormDisabled(hasPendingBooking);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch bookings';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const termsAccepted = localStorage.getItem('termsAccepted');
    if (termsAccepted !== 'true') {
      navigate('/terms');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookingSuccess = () => {
    fetchBookings(true);
  };

  const handleRefresh = () => {
    fetchBookings(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center page">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg page">
      <nav className="bg-white/80 backdrop-blur shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Railway Booking</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <BookingForm onBookingSuccess={handleBookingSuccess} disabled={bookingFormDisabled} />
          </div>

          <div>
            <div className="glass-card hover-glow rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Bookings</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 press"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/80">No bookings yet</p>
                    <p className="text-sm text-white/60 mt-2">Create your first booking to get started</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} onUpdate={handleRefresh} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
