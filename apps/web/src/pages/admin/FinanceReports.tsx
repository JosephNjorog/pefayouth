import { useFinanceSummary, useFinanceReports, useOfferings, useExpenses } from '@/hooks/useApi';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const FinanceReports = () => {
  const { data: financialSummary = [], isLoading: summaryLoading } = useFinanceSummary();
  const { data: reports, isLoading: reportsLoading } = useFinanceReports();
  const { data: offerings = [], isLoading: offeringsLoading } = useOfferings();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();

  const isLoading = summaryLoading || reportsLoading || offeringsLoading || expensesLoading;

  const totalIncome = financialSummary.reduce((s, f) => s + f.income, 0);
  const totalExpenses = financialSummary.reduce((s, f) => s + f.expenses, 0);
  const netBalance = totalIncome - totalExpenses;

  const monthlyData = financialSummary.map(f => ({
    month: f.month.split(' ')[0],
    Income: f.income / 1000,
    Expenses: f.expenses / 1000,
    Balance: f.balance / 1000,
  }));

  // Income sources breakdown
  const offeringIncome = offerings.reduce((s, o) => s + Number(o.amount), 0);
  const eventIncome = reports?.paymentStats?.confirmedTotal ?? 0;
  const totalIncomeAll = offeringIncome + eventIncome;

  // Expense categories summary
  const categoryMap: Record<string, number> = {};
  expenses.filter(e => e.status === 'approved').forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });
  const expByCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

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
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive financial summaries & statements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Income', value: `KES ${(totalIncome / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'bg-primary/10 text-primary' },
          { label: 'Total Expenses', value: `KES ${(totalExpenses / 1000).toFixed(0)}K`, icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
          { label: 'Net Balance', value: `KES ${(netBalance / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-secondary text-secondary-foreground' },
          { label: 'Report Period', value: `${financialSummary.length} Months`, icon: Calendar, color: 'bg-accent/10 text-accent-foreground' },
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

      {/* Monthly Chart */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-4">Monthly Income vs Expenses (KES '000)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="hsl(var(--destructive) / 0.6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Income Sources */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Income Sources
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Offerings & Tithes</span>
                <span className="font-bold">KES {offeringIncome.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${totalIncomeAll > 0 ? (offeringIncome / totalIncomeAll) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{totalIncomeAll > 0 ? Math.round((offeringIncome / totalIncomeAll) * 100) : 0}% of total</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Event Payments</span>
                <span className="font-bold">KES {eventIncome.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${totalIncomeAll > 0 ? (eventIncome / totalIncomeAll) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{totalIncomeAll > 0 ? Math.round((eventIncome / totalIncomeAll) * 100) : 0}% of total</p>
            </div>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" /> Expense Summary
          </h2>
          <div className="space-y-2">
            {expByCategory.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                <span className="text-xs font-medium">{cat}</span>
                <span className="text-xs font-bold">KES {amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Statement */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Monthly Financial Statement</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Month</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Income</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Expenses</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Net Balance</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Margin</th>
              </tr>
            </thead>
            <tbody>
              {financialSummary.map(f => {
                const margin = f.income > 0 ? Math.round(((f.income - f.expenses) / f.income) * 100) : 0;
                return (
                  <tr key={f.month} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium">{f.month}</td>
                    <td className="px-4 py-3 text-xs text-right text-primary font-medium">KES {f.income.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-right text-destructive">KES {f.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold">KES {f.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        margin > 25 ? 'bg-secondary text-secondary-foreground' : 'bg-accent/10 text-accent-foreground'
                      }`}>{margin}%</span>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/50 font-semibold">
                <td className="px-4 py-3 text-xs">TOTAL</td>
                <td className="px-4 py-3 text-xs text-right text-primary">KES {totalIncome.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-right text-destructive">KES {totalExpenses.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-right font-bold">KES {netBalance.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-center">{totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;
