import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Play, Newspaper, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useApi';
import { Link } from 'react-router-dom';
import { type AppNotification } from '@/lib/api';

interface Props {
  basePath: 'member' | 'admin';
  limit?: number;
}

const typeConfig = (type: AppNotification['type']) => ({
  icon: type === 'event' ? Calendar : type === 'sermon' ? Play : Newspaper,
  iconColor: type === 'event' ? 'text-primary' : type === 'sermon' ? 'text-accent' : 'text-blue-500',
  bg: type === 'event' ? 'bg-primary/10' : type === 'sermon' ? 'bg-accent/10' : 'bg-blue-500/10',
  label: type === 'event' ? 'Event' : type === 'sermon' ? 'Sermon' : 'Newsletter',
});

const STORAGE_KEY = 'pefa_seen_notifications';
function getSeenIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); }
}

export const RecentNotifications = ({ basePath, limit = 5 }: Props) => {
  const { data: notifications = [] } = useNotifications();
  const navigate = useNavigate();
  const seenIds = getSeenIds();

  const items = notifications.slice(0, limit);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Recent Updates</h3>
        </div>
        <Link to={`/${basePath}/notifications`} className="text-xs text-primary font-medium hover:underline">
          View All
        </Link>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">No updates yet</div>
        ) : items.map((n: AppNotification) => {
          const cfg = typeConfig(n.type);
          const Icon = cfg.icon;
          const isUnread = !seenIds.has(n.id);
          return (
            <div
              key={n.id}
              onClick={() => navigate(`/${basePath}/notifications#notif-${n.id}`)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors active:bg-muted ${isUnread ? 'bg-primary/[0.03]' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.iconColor}`}>{cfg.label}</p>
                  {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs font-semibold text-foreground leading-snug mt-0.5">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
                  {n.message.replace(/\n/g, ' ')}
                </p>
                <p className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.iconColor}`}>
                  Read more <ArrowRight className="w-2.5 h-2.5" />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
