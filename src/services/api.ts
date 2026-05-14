import axios from 'axios';

export const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_BASE_URL || 'https://railexpress-backend.onrender.com';
const API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || `${BACKEND_BASE}/api/user`;

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
    preferredTrains?: string[];
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
    return api.post(`/booking/${bookingId}/refund-qr`, formData);
  },

  downloadDocument: (bookingId: string, type: 'ticket' | 'bill') =>
    api.get(`/booking/${bookingId}/download/${type}`, { responseType: 'blob' }),
};

export interface UserNotification {
  _id: string;
  bookingId?: string | null;
  eventType: string;
  title: string;
  body: string;
  url: string;
  readAt?: string | null;
  createdAt: string;
}

export const notificationAPI = {
  list: () => api.get<{ notifications: UserNotification[]; unreadCount: number }>('/notifications'),
  unreadCount: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),
  registerToken: (data: { token: string; platform?: string }) =>
    api.post('/notifications/token', data),
  deleteToken: (token: string) => api.delete('/notifications/token', { data: { token } }),
  markRead: (id: string) => api.patch<UserNotification>(`/notifications/${id}/read`),
  markUnread: (id: string) => api.patch<UserNotification>(`/notifications/${id}/unread`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

export const feedbackAPI = {
  create: (data: { bookingId: string; phone: string; rating: number; comment: string }) =>
    api.post('/feedback/create', data),
  publicList: () => api.get('/public/feedback'),
};

export default api;
