import { useEffect, useMemo, useState } from 'react';
import { bookingAPI } from '../services/api';
import { Calendar, MapPin, User, Phone, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingFormProps {
  onBookingSuccess: () => void;
  disabled: boolean;
}

const BookingForm = ({ onBookingSuccess, disabled }: BookingFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsOk, setTermsOk] = useState(() => localStorage.getItem('termsAccepted') === 'true');
  const [stations, setStations] = useState<Array<{ code: string; name: string; label: string }>>([]);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([
    { name: '', dateOfBirth: '', age: '' },
  ]);
  const [formData, setFormData] = useState({
    fromStation: '',
    toStation: '',
    journeyDate: '',
    bookingType: 'reservation',
    phone: '',
  });

  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await bookingAPI.getStations();
        setStations(response.data?.stations || []);
      } catch {
        // Keep form usable even if station fetch fails.
      }
    };
    loadStations();
  }, []);

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setPassengerDetails((prev) => {
      const next = [...prev];
      if (next.length < passengerCount) {
        for (let i = next.length; i < passengerCount; i += 1) {
          next.push({ name: '', dateOfBirth: '', age: '' });
        }
      } else if (next.length > passengerCount) {
        next.length = passengerCount;
      }
      return next;
    });
  }, [passengerCount]);

  const filterStations = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const exactMatches = stations.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));

    const startsWith = exactMatches.filter(
      (s) => s.name.toLowerCase().startsWith(q) || s.code.toLowerCase().startsWith(q)
    );
    const contains = exactMatches.filter((s) => !startsWith.includes(s));

    return [...startsWith, ...contains].slice(0, 20);
  };

  const fromSuggestions = filterStations(fromQuery);
  const toSuggestions = filterStations(toQuery);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  const handlePassengerFieldChange = (
    index: number,
    field: 'name' | 'dateOfBirth',
    value: string
  ) => {
    setPassengerDetails((prev) => {
      const next = [...prev];
      const current = { ...next[index] };
      if (field === 'dateOfBirth') {
        current.dateOfBirth = value;

        if (value) {
          const dob = new Date(value);
          if (!Number.isNaN(dob.getTime())) {
            const today = new Date();
            let ageYears = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
              ageYears -= 1;
            }
            if (ageYears < 0) ageYears = 0;
            current.age = String(ageYears);
          } else {
            current.age = '';
          }
        } else {
          current.age = '';
        }
      } else {
        current.name = value;
      }

      next[index] = current;
      return next;
    });

    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (
      !formData.fromStation ||
      !formData.toStation ||
      !formData.journeyDate ||
      !formData.bookingType ||
      !formData.phone
    ) {
      setError('Route, journey date, booking type and phone are required');
      return false;
    }

    if (formData.fromStation === formData.toStation) {
      setError('From Station and To Station cannot be the same');
      return false;
    }

    if (!passengerCount || passengerCount < 1 || passengerCount > 6) {
      setError('Passengers must be between 1 and 6');
      return false;
    }

    if (passengerDetails.length !== passengerCount) {
      setError('Please fill all passenger entries');
      return false;
    }

    for (let i = 0; i < passengerDetails.length; i += 1) {
      const p = passengerDetails[i];
      if (!p.name || !p.dateOfBirth || !p.age) {
        setError(`Passenger ${i + 1} name, DOB, and age are required`);
        return false;
      }
      if (/^\d+$/.test(p.name)) {
        setError(`Passenger ${i + 1} name cannot be only numbers`);
        return false;
      }
      const ageNum = Number(p.age);
      if (Number.isNaN(ageNum) || ageNum < 1) {
        setError(`Passenger ${i + 1} age must be at least 1`);
        return false;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.journeyDate);

    // Helper to format a Date as local YYYY-MM-DD (no timezone shift bugs)
    const toLocalYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (formData.bookingType === 'tatkal') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayStr = toLocalYmd(today);
      const tomorrowStr = toLocalYmd(tomorrow);
      const selectedStr = formData.journeyDate;

      if (selectedStr !== todayStr && selectedStr !== tomorrowStr) {
        setError('Tatkal booking is allowed only for today or tomorrow');
        return false;
      }
    }

    if (selectedDate < today) {
      setError('Journey date must be today or a future date');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || disabled) return;

    if (!termsOk) {
      setError('Please read and accept the Terms & Conditions before creating a booking.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      await bookingAPI.create({
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        journeyDate: formData.journeyDate,
        bookingType: formData.bookingType as 'tatkal' | 'reservation',
        phone: formData.phone,
        passengers: passengerCount,
        passengerDetails: passengerDetails.map((p) => ({
          name: p.name,
          dateOfBirth: p.dateOfBirth,
          age: Number(p.age),
        })),
      });

      setSuccess('Booking created successfully!');
      setFormData({
        fromStation: '',
        toStation: '',
        journeyDate: '',
        bookingType: 'reservation',
        phone: '',
      });
      setPassengerCount(1);
      setPassengerDetails([{ name: '', dateOfBirth: '', age: '' }]);
      setFromQuery('');
      setToQuery('');
      setFromOpen(false);
      setToOpen(false);

      setTimeout(() => {
        onBookingSuccess();
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Booking failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card hover-glow rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Booking</h2>

      {disabled && (
        <div className="bg-yellow-50/90 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-lg mb-4">
          Booking form is currently locked. Please wait for admin approval on pending bookings.
        </div>
      )}

      {error && (
        <div className="bg-red-50/90 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50/90 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white/10 ring-1 ring-white/15 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5"
              checked={termsOk}
              onChange={(e) => {
                const v = e.target.checked;
                setTermsOk(v);
                if (v) localStorage.setItem('termsAccepted', 'true');
                setError('');
              }}
              disabled={loading || disabled}
            />
            <div className="text-sm text-white/85">
              <div className="font-semibold">Read Terms & Conditions before booking</div>
              <div className="text-white/70">
                I have read and agree to the{' '}
                <Link to="/terms" className="text-sky-200 hover:underline">
                  Terms & Conditions
                </Link>
                .
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="fromStationInput" className="block text-sm font-medium text-white/80 mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                From Station
              </div>
            </label>
            <input
              type="text"
              id="fromStationInput"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setFromOpen(true);
                setFormData((prev) => ({ ...prev, fromStation: '' }));
                setError('');
                setSuccess('');
              }}
              onFocus={() => setFromOpen(true)}
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Type station code or name (e.g., h)"
              disabled={loading || disabled}
            />
            {fromOpen && fromSuggestions.length > 0 && !disabled && (
              <div className="absolute left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {fromSuggestions.map((station) => (
                  <button
                    key={`from-sugg-${station.code}-${station.name}`}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onMouseDown={() => {
                      setFormData((prev) => ({ ...prev, fromStation: station.label }));
                      setFromQuery(station.label);
                      setFromOpen(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    {station.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="toStationInput" className="block text-sm font-medium text-white/80 mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                To Station
              </div>
            </label>
            <input
              type="text"
              id="toStationInput"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setToOpen(true);
                setFormData((prev) => ({ ...prev, toStation: '' }));
                setError('');
                setSuccess('');
              }}
              onFocus={() => setToOpen(true)}
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Type station code or name (e.g., h)"
              disabled={loading || disabled}
            />
            {toOpen && toSuggestions.length > 0 && !disabled && (
              <div className="absolute left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {toSuggestions.map((station) => (
                  <button
                    key={`to-sugg-${station.code}-${station.name}`}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onMouseDown={() => {
                      setFormData((prev) => ({ ...prev, toStation: station.label }));
                      setToQuery(station.label);
                      setToOpen(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    {station.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="journeyDate" className="block text-sm font-medium text-white/80 mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Journey Date
            </div>
          </label>
          <input
            type="date"
            id="journeyDate"
            name="journeyDate"
            value={formData.journeyDate}
            onChange={handleChange}
            min={todayDate}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading || disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bookingType" className="block text-sm font-medium text-white/80 mb-1">
              Booking Type
            </label>
            <select
              id="bookingType"
              name="bookingType"
              value={formData.bookingType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading || disabled}
            >
              <option value="reservation">Reservation</option>
              <option value="tatkal">Tatkal</option>
            </select>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="10 digit phone number"
              disabled={loading || disabled}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-white/80 text-sm">Passengers:</span>
          <button
            type="button"
            onClick={() => setPassengerCount((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1 bg-gray-600 text-white rounded-lg"
            disabled={loading || disabled || passengerCount <= 1}
          >
            -
          </button>
          <span className="px-3 py-1 bg-white/10 rounded-lg text-white">{passengerCount}</span>
          <button
            type="button"
            onClick={() => setPassengerCount((prev) => Math.min(6, prev + 1))}
            className="px-3 py-1 bg-gray-600 text-white rounded-lg"
            disabled={loading || disabled || passengerCount >= 6}
          >
            +
          </button>
          <span className="text-white/60 text-sm">(1 to 6 passengers)</span>
        </div>

        <div className="space-y-4 mt-4">
          {passengerDetails.map((passenger, index) => (
            <div
              key={`passenger-${index}`}
              className="bg-white/10 border border-white/15 p-4 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Passenger {index + 1}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-1">Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerFieldChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Full name"
                    disabled={loading || disabled}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => handlePassengerFieldChange(index, 'dateOfBirth', e.target.value)}
                    max={todayDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading || disabled}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-1">Estimated Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="Auto"
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || disabled}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
        >
          {loading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
