import { useState } from 'react';
import { events } from '@/data/mockData';
import { Calendar, Plus, Edit, Trash2, ChevronDown, MapPin, Clock, Users, DollarSign, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const eventTypes = ['service', 'seminar', 'retreat', 'camp', 'fellowship', 'outreach'] as const;

const EventManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const upcoming = events.filter(e => new Date(e.date) >= new Date());
  const past = events.filter(e => new Date(e.date) < new Date());
  const filtered = filterType === 'all' ? events : events.filter(e => e.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage all events</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold">{events.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Events</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold text-primary">{upcoming.length}</p>
          <p className="text-[10px] text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-center">
          <p className="text-lg font-bold text-muted-foreground">{past.length}</p>
          <p className="text-[10px] text-muted-foreground">Past</p>
        </div>
      </div>

      {/* Create Event Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Create New Event</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Event Title" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 sm:col-span-2" />
            <textarea placeholder="Event Description" rows={3}
              className="px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 sm:col-span-2" />
            <input type="date" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input placeholder="Time (e.g. 09:00 AM)" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input placeholder="Location" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="relative">
              <select className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">Event Type</option>
                {eventTypes.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <input placeholder="Capacity" type="number" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input placeholder="Price (KES, leave 0 for free)" type="number" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">Create Event</button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          All
        </button>
        {eventTypes.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filtered.map((event, i) => {
          const isUpcoming = new Date(event.date) >= new Date();
          return (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                className="w-full px-4 py-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                  isUpcoming ? 'gradient-primary' : 'bg-muted'
                } ${isUpcoming ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  <span className="text-xs font-bold leading-none">{new Date(event.date).getDate()}</span>
                  <span className="text-[8px]">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{event.title}</h3>
                    {!isUpcoming && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Past</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.registered}/{event.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{event.type}</span>
                    {event.isPaid && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">KES {event.price?.toLocaleString()}</span>}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1 ${expandedId === event.id ? 'rotate-180' : ''}`} />
              </button>
              {expandedId === event.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EventManagement;
