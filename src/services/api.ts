import axios from 'axios';

const API_BASE_URL = 'https://railexpress-backend.onrender.com/api/user';
export const BACKEND_BASE = 'https://railexpress-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const accountAPI = {
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/account/change-password', data),
};

export const bookingAPI = {
  create: (data: {
    fromStation: string;
    toStation: string;
    journeyDate: string;
    bookingType: 'tatkal' | 'reservation';
    phone: string;
    passengers: number;
    passengerDetails: Array<{
      name: string;
      dateOfBirth: string;
      age: number;
    }>;
  }) => api.post('/booking/create', data),

  getUserBookings: (userId: string) =>
    api.get(`/booking/user/${userId}`),

  getStations: () => api.get('/booking/stations'),

  markPaymentDone: (bookingId: string, type: 'advance' | 'final') =>
    api.put(`/booking/${bookingId}/payment-done`, { type }),

  uploadRefundQR: (bookingId: string, file: File) => {
    const formData = new FormData();
    formData.append('refundQR', file);
    return api.post(`/booking/${bookingId}/refund-qr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const feedbackAPI = {
  create: (data: { bookingId: string; phone: string; rating: number; comment: string }) =>
    api.post('/feedback/create', data),
  publicList: () => api.get('/public/feedback'),
};

export default api;
