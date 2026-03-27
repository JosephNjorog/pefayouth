import { Calendar, Users, TrendingUp, ChevronRight, Loader2, CheckCircle2, Bell, Play, Newspaper, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents, useSermons, useAttendance, useMember, useRegisterForEvent, useNotifications } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { type AppNotification } from '@/lib/api';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);
  const registerForEvent = useRegisterForEvent();

  const { data: upcomingEventsData = [], isLoading: eventsLoading } = useEvents({ upcoming: 'true' });
  const { data: sermons = [], isLoading: sermonsLoading } = useSermons();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: member, isLoading: memberLoading } = useMember(user?.memberId);
  const { data: notifications = [] } = useNotifications();

  const isLoading = eventsLoading || sermonsLoading || attendanceLoading || memberLoading;

  const upcomingEvents = upcomingEventsData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentSermon = sermons[0];
  const recentAttendance = attendance.slice(0, 5);
  const presentCount = attendance.filter(a => a.present).length;

  const memberName = member?.name ?? user?.name ?? 'Friend';
  const attendanceRate = member?.attendanceRate ? `${member.attendanceRate}%` : `${attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0}%`;
  const cellGroup = member?.cellGroup ?? '';

  // Today's service event (type === 'service' and date === today)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysService = upcomingEvents.find(e => e.type === 'service' && e.date === todayStr);

  const handleCheckIn = async () => {
    if (!todaysService) {
      toast.info('No service scheduled for today.');
      return;
    }
    try {
      await registerForEvent.mutateAsync(todaysService.id);
      setCheckedIn(true);
      toast.success('Checked in! God bless you.');
    } catch (err: any) {
      // If already registered or full, still show as success UX
      setCheckedIn(true);
      toast.success('Checked in! God bless you.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-6">
      {/* Top row: Greeting + Quick Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Greeting Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden lg:col-span-2 text-white"
          style={{ minHeight: '160px' }}
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-church-teal-dark/85 via-primary/70 to-transparent" />
          {/* Content */}
          <div className="relative p-5 lg:p-6">
            <h1 className="text-xl lg:text-2xl font-bold">Hello, {memberName.split(' ')[0]}! 👋</h1>
            <p className="text-sm opacity-80 mt-1">God's grace is sufficient for you today</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold">{attendanceRate}</p>
                <p className="text-[10px] opacity-70">Attendance</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold">{presentCount}/{attendance.length}</p>
                <p className="text-[10px] opacity-70">Services</p>
              </div>
              {cellGroup && (
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center flex-1">
                  <p className="text-sm font-semibold">{cellGroup}</p>
                  <p className="text-[10px] opacity-70">Cell Group</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Check-in */}
        <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Quick Check-in</h2>
            <span className="text-xs text-muted-foreground">{todaysService ? todaysService.title : "Today's Service"}</span>
          </div>
          {checkedIn ? (
            <div className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Checked In!
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={registerForEvent.isPending}
              className="w-full py-3 rounded-xl gradient-gold text-accent-foreground font-semibold text-sm shadow-gold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {registerForEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓'} Check In to Service
            </button>
          )}
        </div>
      </div>

      {/* Middle row: Upcoming Events + Latest Sermon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Events
            </h2>
            <Link to="/member/events" className="text-xs text-primary font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-2.5">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/member/events/${event.id}`}
                  className="flex items-center gap-3 bg-card rounded-xl border border-border p-3.5 shadow-sm hover:shadow-church transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-primary-foreground shrink-0 ${
                    event.isPaid ? 'gradient-gold' : 'gradient-primary'
                  }`}>
                    <span className="text-xs font-bold leading-none">
                      {new Date(event.date).toLocaleDateString('en', { day: 'numeric' })}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.time} · {event.location}</p>
                    {event.isPaid && (
                      <span className="inline-block mt-1 text-[10px] font-medium bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full">
                        KES {Number(event.price ?? 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Latest Sermon */}
        {recentSermon && (
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Latest Sermon
            </h2>
            <Link
              to="/member/media"
              className="block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-church transition-all group"
            >
              <div className="gradient-hero h-28 lg:h-36 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-2xl">▶</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm">{recentSermon.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {recentSermon.speaker} · {recentSermon.duration}
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          Recent Attendance
        </h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {recentAttendance.map((record, i) => (
            <div
              key={record.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i < recentAttendance.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium">{record.eventTitle ?? 'Service'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                record.present
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {record.present ? '✓ Present' : '✗ Absent'}
              </span>
            </div>
          ))}
          {recentAttendance.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No attendance records yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Updates / Notifications */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Recent Updates</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          {notifications.slice(0, 5).map((n: AppNotification) => {
            const iconColor = n.type === 'event' ? 'text-primary' : n.type === 'sermon' ? 'text-accent' : 'text-blue-500';
            const iconBg = n.type === 'event' ? 'bg-primary/10' : n.type === 'sermon' ? 'bg-accent/10' : 'bg-blue-500/10';
            const label = n.type === 'event' ? 'Event' : n.type === 'sermon' ? 'Sermon' : 'Newsletter';
            return (
              <div
                key={n.id}
                onClick={() => navigate(`/member/notifications#notif-${n.id}`)}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors active:bg-muted"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                  {n.type === 'event' && <Calendar className={`w-4 h-4 ${iconColor}`} />}
                  {n.type === 'sermon' && <Play className={`w-4 h-4 ${iconColor}`} />}
                  {n.type === 'newsletter' && <Newspaper className={`w-4 h-4 ${iconColor}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${iconColor}`}>{label}</p>
                  <p className="text-xs font-semibold text-foreground leading-snug mt-0.5">{n.title}</p>
                  <div className="text-xs text-muted-foreground leading-relaxed mt-0.5 space-y-0.5 line-clamp-2">
                    {n.message.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                  <p className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${iconColor}`}>
                    Read more <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No updates yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
