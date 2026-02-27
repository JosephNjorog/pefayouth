import { useState } from 'react';
import { useRecords, useCreateRecord, useUpdateRecord, useDeleteRecord } from '@/hooks/useApi';
import { FileText, Plus, Calendar, User, ChevronDown, Edit, Trash2, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Records = () => {
  const [filter, setFilter] = useState<string>('all');
  const [showNew, setShowNew] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('meeting');
  const [formContent, setFormContent] = useState('');

  const { data: records = [], isLoading } = useRecords(filter !== 'all' ? { type: filter } : undefined);
  const { mutateAsync: createRecord, isPending } = useCreateRecord();
  const { mutateAsync: updateRecord, isPending: updating } = useUpdateRecord();
  const { mutateAsync: deleteRecord } = useDeleteRecord();

  const filteredNotes = filter === 'all'
    ? records
    : records.filter(n => n.type === filter);

  const handleCreate = async () => {
    if (!formTitle || !formContent) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createRecord({
        title: formTitle,
        type: formType,
        content: formContent,
        date: new Date().toISOString().split('T')[0],
        author: 'Admin',
      });
      toast.success('Record saved successfully');
      setFormTitle('');
      setFormType('meeting');
      setFormContent('');
      setShowNew(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const startEdit = (note: { id: string; title: string; content: string }) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleUpdate = async () => {
    if (!editingId || !editTitle || !editContent) return;
    try {
      await updateRecord({ id: editingId, data: { title: editTitle, content: editContent } });
      toast.success('Record updated');
      setEditingId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update record');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      toast.success('Record deleted');
      if (expandedNote === id) setExpandedNote(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record');
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
          <h1 className="text-2xl font-bold">Records</h1>
          <p className="text-sm text-muted-foreground mt-1">Meeting notes and event documentation</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {/* New Note Form */}
      {showNew && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-3">New Record</h3>
          <div className="space-y-3">
            <input
              placeholder="Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="relative">
              <select
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="meeting">Meeting Notes</option>
                <option value="event-note">Event Notes</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <textarea
              placeholder="Write your notes here..."
              rows={4}
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Record
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'all' },
          { label: 'Meetings', value: 'meeting' },
          { label: 'Event Notes', value: 'event-note' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                note.type === 'meeting' ? 'bg-primary/10' : 'bg-accent/10'
              }`}>
                <FileText className={`w-5 h-5 ${note.type === 'meeting' ? 'text-primary' : 'text-accent-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{note.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {note.author}
                  </span>
                </div>
                <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                  note.type === 'meeting' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
                }`}>
                  {note.type.replace('-', ' ')}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1 ${
                expandedNote === note.id ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedNote === note.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4"
              >
                <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground">
                  {note.content}
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3 h-3" />
                    Delete
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

export default Records;
