import { useState } from 'react';
import { useOfferings, useCreateOffering } from '@/hooks/useApi';
import { DollarSign, Plus, Download, Heart, BookOpen, Globe, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const typeIcons = {
  tithe: BookOpen,
  offering: Heart,
  special: Sparkles,
  missions: Globe,
} as const;

const typeColors = {
  tithe: 'bg-primary/10 text-primary',
  offering: 'bg-accent/10 text-accent-foreground',
  special: 'bg-chart-4/10 text-chart-4',
  missions: 'bg-chart-5/10 text-chart-5',
} as const;

const OfferingRecords = () => {
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formType, setFormType] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formService, setFormService] = useState('');
  const [formDate, setFormDate] = useState('');

  const { data: offerings = [], isLoading } = useOfferings();
  const { mutateAsync: createOffering, isPending } = useCreateOffering();

  const totalByType = (['tithe', 'offering', 'special', 'missions'] as const).map(type => ({
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    total: offerings.filter(o => o.type === type).reduce((s, o) => s + Number(o.amount), 0),
    count: offerings.filter(o => o.type === type).length,
  }));

  const grandTotal = offerings.reduce((s, o) => s + Number(o.amount), 0);
  const filtered = filterType === 'all' ? offerings : offerings.filter(o => o.type === filterType);

  const handleSubmit = async () => {
    if (!formType || !formAmount || !formDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createOffering({
        type: formType,
        amount: formAmount,
        service: formService,
        date: formDate,
        recordedBy: 'Admin',
      });
      toast.success('Offering recorded successfully');
      setFormType('');
      setFormAmount('');
      setFormService('');
      setFormDate('');
      setShowAddForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record offering');
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
          <h1 className="text-2xl font-bold">Offerings & Tithes</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and track all church contributions</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Record</span>
          </button>
        </div>
      </div>

      {/* Type Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {totalByType.map((item, i) => {
          const Icon = typeIcons[item.type];
          return (
            <motion.div key={item.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${typeColors[item.type]} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">KES {(item.total / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-muted-foreground">{item.label} ({item.count} records)</p>
            </motion.div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm text-center">
        <p className="text-xs text-muted-foreground mb-1">Total Contributions</p>
        <p className="text-3xl font-bold text-primary">KES {grandTotal.toLocaleString()}</p>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Record Offering/Tithe</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">Type</option>
                <option value="tithe">Tithe</option>
                <option value="offering">Offering</option>
                <option value="special">Special Offering</option>
                <option value="missions">Missions</option>
              </select>
            </div>
            <input
              placeholder="Amount (KES)"
              type="number"
              value={formAmount}
              onChange={e => setFormAmount(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              placeholder="Service/Event"
              value={formService}
              onChange={e => setFormService(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Record
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter & Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2 flex-wrap">
            {['all', 'tithe', 'offering', 'special', 'missions'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Service</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const type = o.type as keyof typeof typeIcons;
                const Icon = typeIcons[type] ?? DollarSign;
                const colorClass = typeColors[type] ?? 'bg-muted text-muted-foreground';
                return (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs">{new Date(o.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
                        <Icon className="w-2.5 h-2.5" /> {o.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.service}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold">KES {Number(o.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.recordedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfferingRecords;
