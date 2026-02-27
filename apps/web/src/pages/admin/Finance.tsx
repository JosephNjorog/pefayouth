import { useState } from 'react';
import { DollarSign, CheckCircle, Clock, AlertCircle, ChevronDown, TrendingUp, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePayments, useEvents } from '@/hooks/useApi';

const Finance = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEventId, setFilterEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: payments = [], isLoading } = usePayments(filterStatus !== 'all' ? { status: filterStatus } : undefined);
  const { data: events = [] } = useEvents();

  const confirmed = payments.filter(p => p.status === 'confirmed');
  const pending = payments.filter(p => p.status === 'pending');
  const failed = payments.filter(p => p.status === 'failed');

  const totalRevenue = confirmed.reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = pending.reduce((s, p) => s + Number(p.amount), 0);

  const pieData = [
    { name: 'Confirmed', value: confirmed.length, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: pending.length, color: 'hsl(var(--church-gold))' },
    { name: 'Failed', value: failed.length, color: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  const paidEvents = events.filter(e => e.isPaid);
  const revenueByEvent = paidEvents.map(event => ({
    event: event.title,
    total: payments.filter(p => p.eventId === event.id && p.status === 'confirmed').reduce((s, p) => s + Number(p.amount), 0),
    pendingAmt: payments.filter(p => p.eventId === event.id && p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0),
  }));

  const filteredPayments = payments.filter(p => {
    const matchEvent = !filterEventId || p.eventId === filterEventId;
    const matchSearch = !searchQuery || (p.memberName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchEvent && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track event payments and revenue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-primary/10 text-primary' },
          { label: 'Pending', value: `KES ${pendingAmount.toLocaleString()}`, icon: Clock, color: 'bg-accent/10 text-accent-foreground' },
          { label: 'Confirmed', value: confirmed.length, icon: CheckCircle, color: 'bg-secondary text-secondary-foreground' },
          { label: 'Failed', value: failed.length, icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-3 lg:p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}><stat.icon className="w-4 h-4" /></div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Payment Status</h2>
          {pieData.length > 0 ? (
            <>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No payment data yet</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Revenue by Event</h2>
          <div className="space-y-3">
            {revenueByEvent.map(item => (
              <div key={item.event} className="p-3 bg-muted/30 rounded-xl">
                <p className="text-sm font-medium mb-1">{item.event}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-medium">KES {item.total.toLocaleString()} confirmed</span>
                  {item.pendingAmt > 0 && <span className="text-accent-foreground">KES {item.pendingAmt.toLocaleString()} pending</span>}
                </div>
              </div>
            ))}
            {revenueByEvent.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No paid events yet</p>}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold mb-3">All Payments</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by member name..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select value={filterEventId} onChange={e => setFilterEventId(e.target.value)} className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="">All Events</option>
                  {paidEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No payments found</td></tr>
              ) : filteredPayments.map(payment => (
                <tr key={payment.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        {(payment.memberName || 'M').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-medium">{payment.memberName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{payment.eventTitle || '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium">KES {Number(payment.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${payment.status === 'confirmed' ? 'bg-secondary text-secondary-foreground' : payment.status === 'pending' ? 'bg-accent/10 text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}>
                      {payment.status === 'confirmed' ? <CheckCircle className="w-2.5 h-2.5" /> : payment.status === 'pending' ? <Clock className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
