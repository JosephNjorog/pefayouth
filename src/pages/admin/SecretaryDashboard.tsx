import { members, events, attendanceRecords } from '@/data/mockData';
import { newsletters } from '@/data/adminMockData';
import { Users, Calendar, FileText, Newspaper, Film, TrendingUp, UserPlus, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const SecretaryDashboard = () => {
  const totalMembers = members.length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const publishedNewsletters = newsletters.filter(n => n.status === 'published').length;
  const avgAttendance = Math.round(
    attendanceRecords.reduce((sum, a) => sum + (a.present / a.total) * 100, 0) / attendanceRecords.length
  );

  const statCards = [
    { label: 'Total Members', value: totalMembers, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Upcoming Events', value: upcomingEvents, icon: Calendar, color: 'bg-accent/10 text-accent-foreground' },
    { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: TrendingUp, color: 'bg-secondary text-secondary-foreground' },
    { label: 'Newsletters', value: publishedNewsletters, icon: Newspaper, color: 'bg-chart-5/10 text-chart-5' },
  ];

  const quickActions = [
    { label: 'Add New Member', icon: UserPlus, link: '/admin/members' },
    { label: 'Post Event', icon: Calendar, link: '/admin/event-management' },
    { label: 'Write Newsletter', icon: Newspaper, link: '/admin/newsletters' },
    { label: 'Upload Media', icon: Film, link: '/admin/media' },
    { label: 'Take Notes', icon: FileText, link: '/admin/records' },
    { label: 'View Attendance', icon: Users, link: '/admin/attendance' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Secretary Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage members, events, and communications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {quickActions.map(action => (
            <a key={action.label} href={action.link}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Newsletters */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Recent Newsletters</h2>
          <div className="space-y-3">
            {newsletters.slice(0, 4).map(nl => (
              <div key={nl.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  nl.category === 'announcement' ? 'bg-accent/10 text-accent-foreground' :
                  nl.category === 'devotional' ? 'bg-primary/10 text-primary' :
                  nl.category === 'prayer' ? 'bg-chart-4/10 text-chart-4' :
                  'bg-secondary text-secondary-foreground'
                }`}>
                  <Newspaper className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{nl.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{nl.author} · {new Date(nl.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  nl.status === 'published' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {nl.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.filter(e => new Date(e.date) >= new Date()).slice(0, 4).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="w-10 h-10 rounded-lg gradient-primary flex flex-col items-center justify-center text-primary-foreground shrink-0">
                  <span className="text-xs font-bold leading-none">{new Date(event.date).getDate()}</span>
                  <span className="text-[8px]">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground">{event.time} · {event.registered}/{event.capacity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
