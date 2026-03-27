import { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, Play, Newspaper, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useApi';
import { type AppNotification } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pefa_seen_notifications';

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const typeIcon = (type: AppNotification['type']) => {
  if (type === 'event')      return <Calendar className="w-4 h-4 text-primary" />;
  if (type === 'sermon')     return <Play className="w-4 h-4 text-accent" />;
  if (type === 'newsletter') return <Newspaper className="w-4 h-4 text-blue-500" />;
};

const typeBg = (type: AppNotification['type']) => {
  if (type === 'event')      return 'bg-primary/10';
  if (type === 'sermon')     return 'bg-accent/10';
  if (type === 'newsletter') return 'bg-blue-500/10';
  return 'bg-muted';
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  /** 'light' for dark backgrounds (admin sidebar), 'default' for card backgrounds */
  variant?: 'light' | 'default';
}

export const NotificationBell = ({ variant = 'default' }: Props) => {
  const { data: notifications = [] } = useNotifications();
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenIds);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !seenIds.has(n.id)).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => {
    const all = new Set(notifications.map(n => n.id));
    setSeenIds(all);
    saveSeenIds(all);
  };

  const markRead = (id: string) => {
    const next = new Set(seenIds).add(id);
    setSeenIds(next);
    saveSeenIds(next);
  };

  const handleOpen = () => {
    setOpen(v => !v);
  };

  const btnClass = variant === 'light'
    ? 'p-2 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors'
    : 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={handleOpen} className={btnClass} aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => {
                  const isUnread = !seenIds.has(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${typeBg(n.type)}`}>
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
