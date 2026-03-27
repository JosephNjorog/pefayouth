import { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, Play, Newspaper, CheckCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/contexts/AuthContext';
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

const typeConfig = (type: AppNotification['type']) => ({
  icon: type === 'event' ? Calendar : type === 'sermon' ? Play : Newspaper,
  iconColor: type === 'event' ? 'text-primary' : type === 'sermon' ? 'text-accent' : 'text-blue-500',
  bg: type === 'event' ? 'bg-primary/10' : type === 'sermon' ? 'bg-accent/10' : 'bg-blue-500/10',
  label: type === 'event' ? 'Event' : type === 'sermon' ? 'Sermon' : 'Newsletter',
});

interface Props {
  variant?: 'light' | 'default';
}

export const NotificationBell = ({ variant = 'default' }: Props) => {
  const { data: notifications = [] } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenIds);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isAdmin = user ? isAdminRole(user.role) : false;
  const unreadCount = notifications.filter(n => !seenIds.has(n.id)).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setExpanded(null);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setExpanded(null); }
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const markRead = (id: string) => {
    const next = new Set(seenIds).add(id);
    setSeenIds(next);
    saveSeenIds(next);
  };

  const markAllRead = () => {
    const all = new Set(notifications.map(n => n.id));
    setSeenIds(all);
    saveSeenIds(all);
  };

  const notifPagePath = isAdmin ? '/admin/notifications' : '/member/notifications';

  const getTypePath = (type: AppNotification['type']) => {
    if (isAdmin) {
      if (type === 'event')      return '/admin/event-management';
      if (type === 'sermon')     return '/admin/media';
      if (type === 'newsletter') return '/admin/newsletters';
    } else {
      if (type === 'event')      return '/member/events';
      if (type === 'sermon')     return '/member/media';
      if (type === 'newsletter') return '/member';
    }
    return '#';
  };

  const handleNotificationClick = (n: AppNotification) => {
    markRead(n.id);
    if (expanded !== n.id) {
      setExpanded(n.id);
      return;
    }
    // Second click: go to full notifications page
    setOpen(false);
    setExpanded(null);
    navigate(`${notifPagePath}#notif-${n.id}`);
  };

  const handleView = (e: React.MouseEvent, n: AppNotification) => {
    e.stopPropagation();
    markRead(n.id);
    setOpen(false);
    setExpanded(null);
    navigate(getTypePath(n.type));
  };

  const goToAllNotifications = () => {
    setOpen(false);
    setExpanded(null);
    navigate(notifPagePath);
  };

  const btnClass = variant === 'light'
    ? 'relative p-2 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors'
    : 'relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => { setOpen(v => !v); setExpanded(null); }} className={btnClass} aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 sm:hidden"
              onClick={() => { setOpen(false); setExpanded(null); }}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              // Mobile: fixed, centered, full-width with margin
              // Desktop: absolute dropdown anchored to right of bell
              className="
                fixed left-3 right-3 top-[70px] z-50
                sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:inset-[unset]
                bg-card border border-border rounded-2xl shadow-2xl overflow-hidden
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
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
                  <button
                    onClick={() => { setOpen(false); setExpanded(null); }}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => {
                    const isUnread = !seenIds.has(n.id);
                    const isExpanded = expanded === n.id;
                    const cfg = typeConfig(n.type);
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`cursor-pointer flex items-start gap-3 px-4 py-3 transition-colors
                          ${isUnread ? 'bg-primary/5' : ''}
                          hover:bg-muted/60 active:bg-muted
                        `}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.iconColor}`}>
                              {cfg.label}
                            </span>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            <span className="text-[10px] text-muted-foreground/60 ml-auto">{timeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{n.title}</p>
                          <div className={`text-xs text-muted-foreground leading-relaxed mt-1 space-y-0.5 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {n.message.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>

                          {isExpanded ? (
                            <button
                              onClick={(e) => handleView(e, n)}
                              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${cfg.iconColor} hover:underline`}
                            >
                              View {cfg.label} <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/40 mt-1 italic">Tap to read more</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
