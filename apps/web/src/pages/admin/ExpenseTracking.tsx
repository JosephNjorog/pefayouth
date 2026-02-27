import { useState } from 'react';
import { useExpenses, useCreateExpense } from '@/hooks/useApi';
import { DollarSign, Plus, Search, ChevronDown, CheckCircle, Clock, XCircle, Receipt, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const expenseCategories = [
  'Utilities', 'Salaries', 'Ministry', 'Events', 'Maintenance',
  'Equipment', 'Outreach', 'Administration', 'Transport', 'Other',
];

const ExpenseTracking = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formReceiptNo, setFormReceiptNo] = useState('');
  const [formApprovedBy, setFormApprovedBy] = useState('');

  const { data: expenses = [], isLoading } = useExpenses();
  const { mutateAsync: createExpense, isPending } = useCreateExpense();

  const approvedTotal = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.amount), 0);
  const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);

  const categoryTotals = expenseCategories.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat && e.status === 'approved').reduce((s, e) => s + Number(e.amount), 0),
  })).sort((a, b) => b.total - a.total);

  const filtered = expenses.filter(e => {
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Category', 'Amount (KES)', 'Status', 'Receipt No', 'Approved By']];
    filtered.forEach(e => rows.push([e.date, e.description, e.category, String(Number(e.amount)), e.status, e.receiptNo || '', e.approvedBy || '']));
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!formDescription || !formAmount || !formCategory || !formDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createExpense({
        description: formDescription,
        amount: formAmount,
        category: formCategory,
        date: formDate,
        receiptNo: formReceiptNo || undefined,
        approvedBy: formApprovedBy || undefined,
        status: 'pending',
      });
      toast.success('Expense recorded successfully');
      setFormDescription('');
      setFormAmount('');
      setFormCategory('');
      setFormDate('');
      setFormReceiptNo('');
      setFormApprovedBy('');
      setShowAddForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record expense');
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
          <h1 className="text-2xl font-bold">Expense Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and monitor all operational costs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Record Expense</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"><DollarSign className="w-4 h-4" /></div>
          <p className="text-lg font-bold">KES {approvedTotal.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Approved Expenses</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent-foreground flex items-center justify-center mb-2"><Clock className="w-4 h-4" /></div>
          <p className="text-lg font-bold">KES {pendingTotal.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Pending Approval</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center mb-2"><Receipt className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{expenses.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Records</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Record New Expense</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Description"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              placeholder="Amount (KES)"
              type="number"
              value={formAmount}
              onChange={e => setFormAmount(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="relative">
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">Select Category</option>
                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              placeholder="Receipt Number (optional)"
              value={formReceiptNo}
              onChange={e => setFormReceiptNo(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              placeholder="Approved By"
              value={formApprovedBy}
              onChange={e => setFormApprovedBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Expense
            </button>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Expense by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {categoryTotals.filter(c => c.total > 0).map(c => (
            <div key={c.category} className="p-2.5 bg-muted/30 rounded-xl text-center">
              <p className="text-xs font-medium truncate">{c.category}</p>
              <p className="text-sm font-bold mt-0.5">KES {(c.total / 1000).toFixed(0)}K</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search expenses..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Categories</option>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium max-w-[200px] truncate">{exp.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{exp.category}</td>
                  <td className="px-4 py-3 text-xs font-medium">KES {Number(exp.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      exp.status === 'approved' ? 'bg-secondary text-secondary-foreground' :
                      exp.status === 'pending' ? 'bg-accent/10 text-accent-foreground' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {exp.status === 'approved' ? <CheckCircle className="w-2.5 h-2.5" /> :
                       exp.status === 'pending' ? <Clock className="w-2.5 h-2.5" /> :
                       <XCircle className="w-2.5 h-2.5" />}
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{exp.receiptNo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracking;
