import { members, events, payments, attendanceRecords } from '@/data/mockData';
import { expenses, offerings, budgetItems, newsletters } from '@/data/adminMockData';
import { Users, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Receipt, Newspaper, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';

const chartData = attendanceRecords
  .filter(a => a.eventTitle.includes('Sunday'))
  .map(a => ({
    name: new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    present: a.present,
    absent: a.absent,
  }));

const AdminDashboard = () => {
  const totalMembers = members.length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOfferings = offerings.reduce((s, o) => s + o.amount, 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgetItems.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetItems.reduce((s, b) => s + b.spent, 0);
  const avgAttendance = Math.round(
    attendanceRecords.reduce((sum, a) => sum + (a.present / a.total) * 100, 0) / attendanceRecords.length
  );

  const statCards = [
    { label: 'Total Youth', value: totalMembers, icon: Users, change: '+3 this month', color: 'bg-primary/10 text-primary' },
    { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: TrendingUp, change: '+5% vs last month', color: 'bg-secondary text-secondary-foreground' },
    { label: 'Upcoming Events', value: upcomingEvents, icon: Calendar, change: 'Next 30 days', color: 'bg-accent/10 text-accent-foreground' },
    { label: 'Total Revenue', value: `KES ${((totalRevenue + totalOfferings) / 1000).toFixed(0)}K`, icon: DollarSign, change: `${pendingPayments.length} pending`, color: 'bg-chart-5/10 text-chart-5' },
  ];

  const financeCards = [
    { label: 'Event Payments', value: `KES ${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Offerings & Tithes', value: `KES ${(totalOfferings / 1000).toFixed(0)}K`, icon: Receipt, color: 'bg-accent/10 text-accent-foreground' },
    { label: 'Total Expenses', value: `KES ${(totalExpenses / 1000).toFixed(0)}K`, icon: Receipt, color: 'bg-destructive/10 text-destructive' },
    { label: 'Budget Remaining', value: `KES ${((totalBudget - totalSpent) / 1000).toFixed(0)}K`, icon: Receipt, color: 'bg-secondary text-secondary-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete overview of YouthConnect operations</p>
      </div>

      {/* Main Stat Cards */}
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

      {/* Financial Overview */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Financial Overview
        </h2>
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
        {/* Attendance Chart */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Sunday Service Attendance</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive) / 0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {payments.slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {payment.memberName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{payment.memberName}</p>
                  <p className="text-[10px] text-muted-foreground">{payment.eventTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">KES {payment.amount.toLocaleString()}</p>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                    payment.status === 'confirmed' ? 'text-primary' :
                    payment.status === 'pending' ? 'text-accent-foreground' : 'text-destructive'
                  }`}>
                    {payment.status === 'confirmed' ? <CheckCircle className="w-2.5 h-2.5" /> :
                     payment.status === 'pending' ? <Clock className="w-2.5 h-2.5" /> :
                     <AlertCircle className="w-2.5 h-2.5" />}
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Upcoming Events
          </h2>
          <div className="space-y-3">
            {events.filter(e => new Date(e.date) >= new Date()).slice(0, 3).map(event => (
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
                  {event.isPaid && <span className="font-medium text-accent-foreground">KES {event.price?.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Newsletters */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" /> Recent Newsletters
          </h2>
          <div className="space-y-3">
            {newsletters.slice(0, 4).map(nl => (
              <div key={nl.id} className="flex items-start gap-3 p-2.5 bg-muted/30 rounded-xl">
                <Newspaper className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{nl.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(nl.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                  nl.status === 'published' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                }`}>{nl.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Status */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Budget Status (Q1)
          </h2>
          <div className="space-y-3">
            {budgetItems.slice(0, 5).map(b => {
              const pct = Math.round((b.spent / b.allocated) * 100);
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-medium truncate">{b.category}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-bold">KES {(totalBudget / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
