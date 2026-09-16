import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AppNotification, MockUser } from '../types';
import { isNotificationVisibleTo, formatRelativeTime } from '../notifications';

interface NotificationBellProps {
  notifications: AppNotification[];
  user: MockUser;
  onMarkRead: (id: string) => void;
  onMarkAllRead: (ids: string[]) => void;
  onNavigate: (key: string) => void;
}

export default function NotificationBell({ notifications, user, onMarkRead, onMarkAllRead, onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const visible = notifications
    .filter((n) => isNotificationVisibleTo(n, user))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const unread = visible.filter((n) => !n.read);

  const handleRowClick = (n: AppNotification) => {
    if (!n.read) onMarkRead(n.id);
    onNavigate(n.navigateTo);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-400 hover:text-navy transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unread.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-navy text-white text-[10px] font-semibold flex items-center justify-center">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Sidebar sits at z-40, so this overlay must sit above it to catch outside clicks there too */}
          <div className="fixed inset-0 z-[45]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-[46] mt-2 w-80 sm:w-96 bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-grey-border">
              <h3 className="text-sm font-semibold text-navy">Notifications</h3>
              {unread.length > 0 && (
                <button
                  onClick={() => onMarkAllRead(unread.map((n) => n.id))}
                  className="inline-flex items-center gap-1 text-xs font-medium text-navy hover:text-navy-light transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all as read
                </button>
              )}
            </div>

            {visible.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {visible.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleRowClick(n)}
                    className={`w-full flex items-start gap-2.5 px-4 py-3 text-left border-b border-grey-border last:border-0 transition-colors hover:bg-grey-bg ${
                      !n.read ? 'bg-navy/5' : ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-navy' : 'bg-transparent'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy leading-snug">
                        {n.messageBefore}
                        <span className="font-semibold">{n.studentName}</span>
                        {n.messageAfter}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
