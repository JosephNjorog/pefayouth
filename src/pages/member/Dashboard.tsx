import { Calendar, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { events, currentMember, sermons, memberAttendanceHistory } from '@/data/mockData';
import { motion } from 'framer-motion';

const MemberDashboard = () => {
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentSermon = sermons[0];
  const recentAttendance = memberAttendanceHistory.slice(0, 5);
  const presentCount = memberAttendanceHistory.filter(a => a.status === 'present').length;

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-6">
      {/* Top row: Greeting + Quick Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Greeting Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-primary rounded-2xl p-5 lg:p-6 text-primary-foreground lg:col-span-2"
        >
          <h1 className="text-xl lg:text-2xl font-bold">Hello, {currentMember.name.split(' ')[0]}! 👋</h1>
          <p className="text-sm opacity-80 mt-1">God's grace is sufficient for you today</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-primary-foreground/15 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold">{currentMember.attendanceRate}%</p>
              <p className="text-[10px] opacity-70">Attendance</p>
            </div>
            <div className="bg-primary-foreground/15 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold">{presentCount}/{memberAttendanceHistory.length}</p>
              <p className="text-[10px] opacity-70">Services</p>
            </div>
            <div className="bg-primary-foreground/15 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-sm font-semibold">{currentMember.cellGroup}</p>
              <p className="text-[10px] opacity-70">Cell Group</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Check-in */}
        <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Quick Check-in</h2>
            <span className="text-xs text-muted-foreground">Today's Service</span>
          </div>
          <button className="w-full py-3 rounded-xl gradient-gold text-accent-foreground font-semibold text-sm shadow-gold hover:shadow-lg transition-all active:scale-[0.98]">
            ✓ Check In to Service
          </button>
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
                        KES {event.price?.toLocaleString()}
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
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i < recentAttendance.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium">{record.event}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                record.status === 'present'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {record.status === 'present' ? '✓ Present' : '✗ Absent'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
