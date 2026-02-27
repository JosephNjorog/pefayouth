import { useState } from 'react';
import { useBudget, useCreateBudgetItem } from '@/hooks/useApi';
import { Wallet, Plus, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';

const COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(174 42% 45%)',
  'hsl(38 70% 60%)', 'hsl(200 50% 55%)', 'hsl(340 55% 55%)', 'hsl(120 30% 50%)',
];

const expenseCategories = [
  'Utilities', 'Salaries', 'Ministry', 'Events', 'Maintenance',
  'Equipment', 'Outreach', 'Administration', 'Transport', 'Other',
];

const BudgetPlanning = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formCategory, setFormCategory] = useState('');
  const [formAllocated, setFormAllocated] = useState('');
  const [formPeriod, setFormPeriod] = useState('');

  const { data: budgetItems = [], isLoading } = useBudget();
  const { mutateAsync: createBudgetItem, isPending } = useCreateBudgetItem();

  const totalAllocated = budgetItems.reduce((s, b) => s + Number(b.allocated), 0);
  const totalSpent = budgetItems.reduce((s, b) => s + Number(b.spent), 0);
  const remaining = totalAllocated - totalSpent;
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const overBudget = budgetItems.filter(b => Number(b.spent) > Number(b.allocated));
  const nearLimit = budgetItems.filter(b => (Number(b.spent) / Number(b.allocated)) > 0.8 && Number(b.spent) <= Number(b.allocated));

  const pieData = budgetItems.filter(b => Number(b.allocated) > 0).map(b => ({
    name: b.category,
    value: Number(b.allocated),
  }));

  const handleSubmit = async () => {
    if (!formCategory || !formAllocated || !formPeriod) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createBudgetItem({
        category: formCategory,
        allocated: formAllocated,
        spent: '0',
        period: formPeriod,
      });
      toast.success('Budget item added successfully');
      setFormCategory('');
      setFormAllocated('');
      setFormPeriod('');
      setShowAddForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add budget item');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget Planning</h1>
          <p className="text-sm text-muted-foreground mt-1">Q1 2026 budget allocation and tracking</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Budget Item</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Budget', value: `KES ${(totalAllocated / 1000).toFixed(0)}K`, icon: Wallet, color: 'bg-primary/10 text-primary' },
          { label: 'Total Spent', value: `KES ${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'bg-accent/10 text-accent-foreground' },
          { label: 'Remaining', value: `KES ${(remaining / 1000).toFixed(0)}K`, icon: CheckCircle, color: 'bg-secondary text-secondary-foreground' },
          { label: 'Utilization', value: `${utilization}%`, icon: AlertTriangle, color: utilization > 80 ? 'bg-destructive/10 text-destructive' : 'bg-chart-5/10 text-chart-5' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Add Budget Item</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              value={formCategory}
              onChange={e => setFormCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option value="">Select Category</option>
              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Allocated Amount (KES)"
              type="number"
              value={formAllocated}
              onChange={e => setFormAllocated(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              placeholder="Period (e.g. Q1 2026)"
              value={formPeriod}
              onChange={e => setFormPeriod(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Allocation Chart */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Budget Allocation</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Budget Alerts</h2>
          <div className="space-y-3">
            {overBudget.length > 0 && overBudget.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{b.category} — Over Budget</p>
                  <p className="text-xs text-muted-foreground">Spent KES {Number(b.spent).toLocaleString()} of KES {Number(b.allocated).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {nearLimit.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
                <AlertTriangle className="w-4 h-4 text-accent-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent-foreground">{b.category} — Near Limit</p>
                  <p className="text-xs text-muted-foreground">{Math.round((Number(b.spent) / Number(b.allocated)) * 100)}% used · KES {(Number(b.allocated) - Number(b.spent)).toLocaleString()} left</p>
                </div>
              </div>
            ))}
            {overBudget.length === 0 && nearLimit.length === 0 && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">All categories within budget. Looking good!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Budget Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Detailed Budget Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Allocated</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Spent</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Remaining</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Usage</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map(b => {
                const allocated = Number(b.allocated);
                const spent = Number(b.spent);
                const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                return (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium">{b.category}</td>
                    <td className="px-4 py-3 text-xs text-right">KES {allocated.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium">{spent > 0 ? `KES ${spent.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-right text-muted-foreground">KES {(allocated - spent).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-medium w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/50 font-semibold">
                <td className="px-4 py-3 text-xs">TOTAL</td>
                <td className="px-4 py-3 text-xs text-right">KES {totalAllocated.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-right">KES {totalSpent.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-right">KES {remaining.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-center">{utilization}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanning;
