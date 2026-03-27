import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Calendar, Play, Newspaper, ArrowRight, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/contexts/AuthContext';
import { type AppNotification } from '@/lib/api';

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
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

const typeConfig = (type: AppNotification['type']) => ({
  icon: type === 'event' ? Calendar : type === 'sermon' ? Play : Newspaper,
  iconColor: type === 'event' ? 'text-primary' : type === 'sermon' ? 'text-accent' : 'text-blue-500',
  bg: type === 'event' ? 'bg-primary/10' : type === 'sermon' ? 'bg-accent/10' : 'bg-blue-500/10',
  label: type === 'event' ? 'Event' : type === 'sermon' ? 'Sermon' : 'Newsletter',
});

const NotificationsPage = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenIds);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto-expand notification referenced in URL hash (e.g. #notif-abc123)
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith('#notif-')) {
      const id = hash.replace('#notif-', '');
      setExpandedId(id);
      markRead(id);
      // Scroll to the element after render
      setTimeout(() => {
        document.getElementById(`notif-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, notifications.length]);

  const isAdmin = user ? isAdminRole(user.role) : false;

  const getNavPath = (type: AppNotification['type']) => {
    if (isAdmin) {
      if (type === 'event') return '/admin/event-management';
      if (type === 'sermon') return '/admin/media';
      if (type === 'newsletter') return '/admin/newsletters';
    } else {
      if (type === 'event') return '/member/events';
      if (type === 'sermon') return '/member/media';
      if (type === 'newsletter') return '/member';
    }
    return '#';
  };

  const markRead = (id: string) => {
    setSeenIds(prev => {
      const next = new Set(prev).add(id);
      saveSeenIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const all = new Set(notifications.map(n => n.id));
    setSeenIds(all);
    saveSeenIds(all);
  };

  const unreadCount = notifications.filter(n => !seenIds.has(n.id)).length;

  const handleNotifClick = (n: AppNotification) => {
    markRead(n.id);
    if (expandedId === n.id) {
      navigate(getNavPath(n.type));
    } else {
      setExpandedId(n.id);
    }
  };

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading…' : `${notifications.length} update${notifications.length !== 1 ? 's' : ''}${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center gap-3">
          <Bell className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground/60">New events, sermons, and newsletters will appear here</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {notifications.map((n, i) => {
            const cfg = typeConfig(n.type);
            const Icon = cfg.icon;
            const isUnread = !seenIds.has(n.id);
            const isExpanded = expandedId === n.id;

            return (
              <motion.div
                key={n.id}
                id={`notif-${n.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleNotifClick(n)}
                className={`flex items-start gap-4 px-4 py-4 cursor-pointer transition-colors hover:bg-muted/40 active:bg-muted ${isUnread ? 'bg-primary/[0.03]' : ''} ${expandedId === n.id ? 'ring-1 ring-primary/20 bg-primary/5' : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${cfg.iconColor}`}>
                      {cfg.label}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="text-[11px] text-muted-foreground/60 ml-auto">{timeAgo(n.createdAt)}</span>
                  </div>

                  <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>

                  {isExpanded ? (
                    <div className="text-sm text-muted-foreground leading-relaxed mt-1.5 space-y-1 block overflow-visible">
                      {n.message.split('\n').map((line, idx) => (
                        <p key={idx} className="break-words">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 line-clamp-3 break-words">
                      {n.message.replace(/\n/g, ' ')}
                    </p>
                  )}

                  {isExpanded ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(getNavPath(n.type)); }}
                      className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${cfg.iconColor} hover:underline`}
                    >
                      View {cfg.label} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 mt-1.5 italic">Tap to expand</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
