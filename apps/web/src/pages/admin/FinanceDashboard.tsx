import { useFinanceSummary, useOfferings, useExpenses, useBudget, usePayments } from '@/hooks/useApi';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';

const FinanceDashboard = () => {
  const { data: financialSummary = [], isLoading: summaryLoading } = useFinanceSummary();
  const { data: offerings = [], isLoading: offeringsLoading } = useOfferings();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: budgetItems = [], isLoading: budgetLoading } = useBudget();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  const isLoading = summaryLoading || offeringsLoading || expensesLoading || budgetLoading || paymentsLoading;

  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const totalEventRevenue = confirmedPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalOfferings = offerings.reduce((s, o) => s + Number(o.amount), 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.amount), 0);
  const totalBudget = budgetItems.reduce((s, b) => s + Number(b.allocated), 0);
  const totalSpent = budgetItems.reduce((s, b) => s + Number(b.spent), 0);
  const netIncome = totalEventRevenue + totalOfferings - totalExpenses;

  const statCards = [
    { label: 'Total Income', value: `KES ${((totalEventRevenue + totalOfferings) / 1000).toFixed(0)}K`, icon: TrendingUp, change: '+12% vs last month', up: true, color: 'bg-primary/10 text-primary' },
    { label: 'Total Expenses', value: `KES ${(totalExpenses / 1000).toFixed(0)}K`, icon: TrendingDown, change: 'Within budget', up: false, color: 'bg-destructive/10 text-destructive' },
    { label: 'Net Balance', value: `KES ${(netIncome / 1000).toFixed(0)}K`, icon: Wallet, change: 'Current period', up: true, color: 'bg-secondary text-secondary-foreground' },
    { label: 'Budget Utilization', value: totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '0%', icon: DollarSign, change: `KES ${((totalBudget - totalSpent) / 1000).toFixed(0)}K remaining`, up: true, color: 'bg-accent/10 text-accent-foreground' },
  ];

  const incomeVsExpense = financialSummary.map(f => ({
    month: f.month.split(' ')[0],
    income: f.income / 1000,
    expenses: f.expenses / 1000,
  }));

  const offeringsByType = ['tithe', 'offering', 'special', 'missions'].map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    amount: offerings.filter(o => o.type === type).reduce((s, o) => s + Number(o.amount), 0),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Financial overview & analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${stat.up ? 'text-primary' : 'text-destructive'}`}>
              {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Income vs Expenses Trend */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Income vs Expenses (KES '000)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeVsExpense}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--destructive))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offerings by Type */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Offerings & Tithes Breakdown</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={offeringsByType} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-4">Q1 2026 Budget Utilization</h2>
        <div className="space-y-3">
          {budgetItems.slice(0, 6).map(item => {
            const allocated = Number(item.allocated);
            const spent = Number(item.spent);
            const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">KES {spent.toLocaleString()} / {allocated.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-accent' : 'bg-primary'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-border">
          {expenses.slice(0, 5).map(exp => (
            <div key={exp.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                exp.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
              }`}>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{exp.description}</p>
                <p className="text-[10px] text-muted-foreground">{exp.category} · {new Date(exp.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-destructive">-KES {Number(exp.amount).toLocaleString()}</p>
                <span className={`text-[10px] font-medium ${exp.status === 'approved' ? 'text-primary' : 'text-accent-foreground'}`}>
                  {exp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
