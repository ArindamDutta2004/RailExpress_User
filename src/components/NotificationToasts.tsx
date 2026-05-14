import { X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationToasts = () => {
  const { toasts, dismissToast, markRead } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="fixed right-3 top-20 z-[60] flex w-[min(92vw,24rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl border border-white/50 bg-white p-4 text-slate-900 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <a
              href={toast.url || '/dashboard'}
              onClick={() => markRead(toast.id)}
              className="min-w-0 flex-1"
            >
              <p className="font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm text-slate-600">{toast.body}</p>
            </a>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
