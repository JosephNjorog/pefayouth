import { Users, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Receipt, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStats, usePayments, useEvents, useNewsletters, useBudget, useAttendance } from '@/hooks/useApi';
import { RecentNotifications } from '@/components/RecentNotifications';

const AdminDashboard = () => {
  const { data: stats } = useFinanceStats();
  const { data: payments = [] } = usePayments();
  const { data: events = [] } = useEvents({ upcoming: 'true' });
  const { data: newsletters = [] } = useNewsletters();
  const { data: budget = [] } = useBudget();
  const { data: attendance = [] } = useAttendance();

  // Build attendance chart from attendance records
  const chartData = attendance
    .filter((a) => a.eventType === 'service')
    .slice(0, 7)
    .map((a) => ({
      name: new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      present: a.present ? 1 : 0,
    }));

  const totalBudget = budget.reduce((s, b) => s + Number(b.allocated), 0);

  const statCards = [
    { label: 'Total Youth', value: stats?.memberCount ?? '—', icon: Users, change: 'Registered members', color: 'bg-primary/10 text-primary' },
    { label: 'Avg Attendance', value: stats ? `${stats.avgAttendanceRate}%` : '—', icon: TrendingUp, change: 'Across all members', color: 'bg-secondary text-secondary-foreground' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? '—', icon: Calendar, change: 'Next 30 days', color: 'bg-accent/10 text-accent-foreground' },
    { label: 'Total Revenue', value: stats ? `KES ${(stats.totalRevenue / 1000).toFixed(0)}K` : '—', icon: DollarSign, change: 'Confirmed payments', color: 'bg-chart-5/10 text-chart-5' },
  ];

  const financeCards = [
    { label: 'Budget Utilization', value: stats ? `${stats.budgetUtilization}%` : '—', icon: Receipt, color: 'bg-primary/10 text-primary' },
    { label: 'Total Allocated', value: stats ? `KES ${(stats.totalAllocated / 1000).toFixed(0)}K` : '—', icon: Receipt, color: 'bg-accent/10 text-accent-foreground' },
    { label: 'Total Spent', value: stats ? `KES ${(stats.totalSpent / 1000).toFixed(0)}K` : '—', icon: Receipt, color: 'bg-destructive/10 text-destructive' },
    { label: 'Newsletters Sent', value: stats?.publishedNewsletters ?? '—', icon: Newspaper, color: 'bg-secondary text-secondary-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete overview of PEFA Youth operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-primary font-medium mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Financial Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {financeCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-card rounded-xl border border-border p-3 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Recent Attendance</h2>
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                  <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No attendance data yet</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {(payment.memberName || 'M').split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{payment.memberName || 'Member'}</p>
                  <p className="text-[10px] text-muted-foreground">{payment.eventTitle || 'Event'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">KES {Number(payment.amount).toLocaleString()}</p>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${payment.status === 'confirmed' ? 'text-primary' : payment.status === 'pending' ? 'text-accent-foreground' : 'text-destructive'}`}>
                    {payment.status === 'confirmed' ? <CheckCircle className="w-2.5 h-2.5" /> : payment.status === 'pending' ? <Clock className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming Events</h2>
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-9 h-9 rounded-lg gradient-primary flex flex-col items-center justify-center text-primary-foreground shrink-0">
                    <span className="text-[10px] font-bold leading-none">{new Date(event.date).getDate()}</span>
                    <span className="text-[7px]">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium truncate">{event.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{event.registered}/{event.capacity} registered</span>
                  {event.isPaid && <span className="font-medium text-accent-foreground">KES {Number(event.price).toLocaleString()}</span>}
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Newspaper className="w-4 h-4 text-primary" /> Recent Newsletters</h2>
          <div className="space-y-3">
            {newsletters.slice(0, 4).map((nl) => (
              <div key={nl.id} className="flex items-start gap-3 p-2.5 bg-muted/30 rounded-xl">
                <Newspaper className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{nl.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(nl.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${nl.status === 'published' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>{nl.status}</span>
              </div>
            ))}
            {newsletters.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No newsletters yet</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Budget Status</h2>
          <div className="space-y-3">
            {budget.slice(0, 5).map((b) => {
              const pct = Math.round((Number(b.spent) / Number(b.allocated)) * 100);
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-medium truncate">{b.category}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {budget.length > 0 && (
              <div className="pt-2 border-t border-border flex justify-between text-xs">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-bold">KES {(totalBudget / 1000).toFixed(0)}K</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecentNotifications basePath="admin" limit={4} />
    </div>
  );
};

export default AdminDashboard;
