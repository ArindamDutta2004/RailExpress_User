import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellRing, CheckCheck, ExternalLink, Mail, MailOpen, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const formatTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    permission,
    loading,
    panelOpen,
    setPanelOpen,
    enableNotifications,
    markRead,
    markUnread,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    if (!panelOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'contain';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscrollBehavior;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [panelOpen, setPanelOpen]);

  const notificationPanel =
    panelOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center bg-slate-950/25 px-3 pt-20 pb-4 backdrop-blur-[2px] sm:justify-end sm:px-6 sm:pt-20"
        role="presentation"
        onMouseDown={() => setPanelOpen(false)}
      >
        <div
          className="flex max-h-[calc(100dvh-6rem)] w-full max-w-96 flex-col overflow-hidden rounded-xl border border-white/40 bg-white shadow-2xl sm:w-[24rem]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-panel-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 id="notification-panel-title" className="font-semibold text-slate-900">
                Notifications
              </h3>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Mark all read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
              <button
                type="button"
                onClick={enableNotifications}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Enable device notifications
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.readAt;
                return (
                  <div
                    key={notification._id}
                    className={`border-b border-slate-100 px-4 py-3 ${
                      isUnread ? 'bg-blue-50/70' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 text-blue-700">
                        {isUnread ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                        <p className="mt-2 text-xs text-slate-400">{formatTime(notification.createdAt)}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a
                            href={notification.url || '/dashboard'}
                            onClick={() => {
                              if (isUnread) markRead(notification._id);
                              setPanelOpen(false);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              isUnread ? markRead(notification._id) : markUnread(notification._id)
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            {isUnread ? 'Mark read' : 'Mark unread'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-800 transition hover:bg-gray-100 press"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {notificationPanel}
    </>
  );
};

export default NotificationBell;
