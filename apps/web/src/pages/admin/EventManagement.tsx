import { useState } from 'react';
import { Plus, ChevronDown, MapPin, Clock, Users, Edit, Trash2, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useApi';
import { toast } from 'sonner';

const eventTypes = ['service', 'seminar', 'retreat', 'camp', 'fellowship', 'outreach'] as const;
const emptyForm = { title: '', description: '', date: '', time: '', location: '', type: '', capacity: '100', price: '0' };

const EventManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const { data: events = [], isLoading } = useEvents(filterType !== 'all' ? { type: filterType } : undefined);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.location || !form.type) return;
    try {
      await createEvent.mutateAsync({ ...form, isPaid: Number(form.price) > 0, capacity: Number(form.capacity), price: form.price });
      toast.success('Event created successfully');
      setForm(emptyForm);
      setShowAddForm(false);
    } catch (err: any) { toast.error(err.message || 'Failed to create event'); }
  };

  const startEdit = (event: typeof events[0]) => {
    setEditEventId(event.id);
    setEditForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      capacity: String(event.capacity),
      price: String(event.price || '0'),
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventId || !editForm.title || !editForm.date || !editForm.time || !editForm.location || !editForm.type) return;
    try {
      await updateEvent.mutateAsync({ id: editEventId, data: { ...editForm, isPaid: Number(editForm.price) > 0, capacity: Number(editForm.capacity) } });
      toast.success('Event updated successfully');
      setEditEventId(null);
    } catch (err: any) { toast.error(err.message || 'Failed to update event'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Event deleted');
      if (expandedId === id) setExpandedId(null);
    } catch (err: any) { toast.error(err.message); }
  };

  const allEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);

  const EventFormFields = ({ values, onChange }: { values: typeof emptyForm; onChange: (f: typeof emptyForm) => void }) => (
    <div className="grid sm:grid-cols-2 gap-3">
      <input required value={values.title} onChange={e => onChange({ ...values, title: e.target.value })} placeholder="Event Title *" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 sm:col-span-2" />
      <textarea value={values.description} onChange={e => onChange({ ...values, description: e.target.value })} placeholder="Event Description" rows={3} className="px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 sm:col-span-2" />
      <input required type="date" value={values.date} onChange={e => onChange({ ...values, date: e.target.value })} className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
      <input required value={values.time} onChange={e => onChange({ ...values, time: e.target.value })} placeholder="Time (e.g. 09:00 AM) *" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
      <input required value={values.location} onChange={e => onChange({ ...values, location: e.target.value })} placeholder="Location *" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
      <div className="relative">
        <select required value={values.type} onChange={e => onChange({ ...values, type: e.target.value })} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="">Event Type *</option>
          {eventTypes.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      <input value={values.capacity} onChange={e => onChange({ ...values, capacity: e.target.value })} placeholder="Capacity" type="number" min="1" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
      <input value={values.price} onChange={e => onChange({ ...values, price: e.target.value })} placeholder="Price KES (0 = free)" type="number" min="0" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage all events</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); setEditEventId(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center"><p className="text-lg font-bold">{events.length}</p><p className="text-[10px] text-muted-foreground">Total Events</p></div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center"><p className="text-lg font-bold text-primary">{upcoming.length}</p><p className="text-[10px] text-muted-foreground">Upcoming</p></div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center"><p className="text-lg font-bold text-muted-foreground">{past.length}</p><p className="text-[10px] text-muted-foreground">Past</p></div>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Create New Event</h3>
          <form onSubmit={handleCreate}>
            <EventFormFields values={form} onChange={setForm} />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={createEvent.isPending} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                {createEvent.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Create Event
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {editEventId && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Edit Event</h3>
            <button onClick={() => setEditEventId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleUpdate}>
            <EventFormFields values={editForm} onChange={setEditForm} />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setEditEventId(null)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={updateEvent.isPending} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                {updateEvent.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>All</button>
        {eventTypes.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((event, i) => {
            const isUpcoming = event.date >= today;
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === event.id ? null : event.id)} className="w-full px-4 py-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUpcoming ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <span className="text-xs font-bold leading-none">{new Date(event.date).getDate()}</span>
                    <span className="text-[8px]">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><h3 className="text-sm font-semibold truncate">{event.title}</h3>{!isUpcoming && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Past</span>}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.registered}/{event.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{event.type}</span>
                      {event.isPaid && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">KES {Number(event.price).toLocaleString()}</span>}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1 ${expandedId === event.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedId === event.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                    <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground">{event.description || 'No description provided.'}</div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => { startEdit(event); setExpandedId(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(event.id, event.title)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
          {allEvents.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No events found</div>}
        </div>
      )}
    </div>
  );
};

export default EventManagement;
