import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { notificationAPI, UserNotification } from '../services/api';
import { listenForForegroundMessages, requestFcmToken } from '../firebase';
import { useAuth } from './AuthContext';

interface ToastNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
}

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  toasts: ToastNotification[];
  permission: NotificationPermission | 'unsupported';
  loading: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  enableNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markUnread: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await notificationAPI.list();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('[notifications] list failed', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const enableNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await requestFcmToken();
      setPermission('Notification' in window ? Notification.permission : 'unsupported');
      if (token) {
        await notificationAPI.registerToken({ token, platform: 'web' });
      }
    } catch (err) {
      console.error('[notifications] registration failed', err);
    }
  }, [isAuthenticated]);

  const markRead = useCallback(
    async (id: string) => {
      await notificationAPI.markRead(id);
      await refreshNotifications();
    },
    [refreshNotifications]
  );

  const markUnread = useCallback(
    async (id: string) => {
      await notificationAPI.markUnread(id);
      await refreshNotifications();
    },
    [refreshNotifications]
  );

  const markAllRead = useCallback(async () => {
    await notificationAPI.markAllRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refreshNotifications();
    enableNotifications();
  }, [enableNotifications, isAuthenticated, refreshNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let unsubscribe: (() => void) | undefined;
    listenForForegroundMessages((payload) => {
      const toastId = payload.data?.notificationId || `${Date.now()}`;
      const title = payload.notification?.title || 'RailXpress Update';
      const body = payload.notification?.body || 'Your booking has a new update.';
      const url = payload.data?.url || payload.data?.click_action || '/dashboard';
      setToasts((current) => [{ id: toastId, title, body, url }, ...current].slice(0, 4));
      refreshNotifications();
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, refreshNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toasts,
      permission,
      loading,
      panelOpen,
      setPanelOpen,
      enableNotifications,
      refreshNotifications,
      markRead,
      markUnread,
      markAllRead,
      dismissToast,
    }),
    [
      dismissToast,
      enableNotifications,
      loading,
      markAllRead,
      markRead,
      markUnread,
      notifications,
      panelOpen,
      permission,
      refreshNotifications,
      toasts,
      unreadCount,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
