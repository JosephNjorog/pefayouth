import { useState } from 'react';
import { useNewsletters, useCreateNewsletter, useDeleteNewsletter } from '@/hooks/useApi';
import { Newspaper, Plus, Edit, Trash2, Send, ChevronDown, Calendar, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const categories = ['announcement', 'devotional', 'update', 'prayer'] as const;
const categoryColors: Record<string, string> = {
  announcement: 'bg-accent/10 text-accent-foreground',
  devotional: 'bg-primary/10 text-primary',
  update: 'bg-secondary text-secondary-foreground',
  prayer: 'bg-chart-4/10 text-chart-4',
};

const Newsletters = () => {
  const [filter, setFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formStatus, setFormStatus] = useState('draft');
  const [formContent, setFormContent] = useState('');

  const { data: newsletters = [], isLoading } = useNewsletters();
  const { mutateAsync: createNewsletter, isPending } = useCreateNewsletter();
  const { mutateAsync: deleteNewsletter } = useDeleteNewsletter();

  const published = newsletters.filter(n => n.status === 'published').length;
  const drafts = newsletters.filter(n => n.status === 'draft').length;
  const filtered = filter === 'all' ? newsletters : newsletters.filter(n => n.category === filter || n.status === filter);

  const handleCreate = async () => {
    if (!formTitle || !formCategory || !formContent) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createNewsletter({
        title: formTitle,
        category: formCategory,
        status: formStatus,
        content: formContent,
        date: new Date().toISOString().split('T')[0],
        author: 'Admin',
      });
      toast.success('Newsletter created successfully');
      setFormTitle('');
      setFormCategory('');
      setFormStatus('draft');
      setFormContent('');
      setShowEditor(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create newsletter');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNewsletter(id);
      toast.success('Newsletter deleted');
      if (expandedId === id) setExpandedId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete newsletter');
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
          <h1 className="text-2xl font-bold">Newsletters</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage church communications</p>
        </div>
        <button onClick={() => setShowEditor(!showEditor)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Newsletter</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold">{newsletters.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold text-primary">{published}</p>
          <p className="text-[10px] text-muted-foreground">Published</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold text-accent-foreground">{drafts}</p>
          <p className="text-[10px] text-muted-foreground">Drafts</p>
        </div>
      </div>

      {/* Editor */}
      {showEditor && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Create Newsletter</h3>
          <div className="space-y-3">
            <input
              placeholder="Newsletter Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Now</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <textarea
              placeholder="Write your newsletter content here..."
              rows={6}
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'published', 'draft', ...categories].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Newsletter List */}
      <div className="space-y-3">
        {filtered.map((nl, i) => (
          <motion.div key={nl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button onClick={() => setExpandedId(expandedId === nl.id ? null : nl.id)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColors[nl.category] ?? 'bg-muted text-muted-foreground'}`}>
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{nl.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    nl.status === 'published' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>{nl.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(nl.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{nl.author}</span>
                </div>
                <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryColors[nl.category] ?? 'bg-muted text-muted-foreground'}`}>
                  {nl.category}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1 ${expandedId === nl.id ? 'rotate-180' : ''}`} />
            </button>
            {expandedId === nl.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {nl.content}
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(nl.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Newsletters;
