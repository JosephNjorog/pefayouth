import { useState } from 'react';
import { Search, Users, UserX, ChevronDown, Loader2, ClipboardCheck, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAttendance, useEvents, useMembers, useRecordAttendance } from '@/hooks/useApi';
import { toast } from 'sonner';

const Attendance = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAbsentees, setShowAbsentees] = useState(false);
  const [markingMode, setMarkingMode] = useState(false);
  const [markedPresent, setMarkedPresent] = useState<Record<string, boolean>>({});

  const { data: events = [] } = useEvents();
  const { data: members = [] } = useMembers();
  const { data: attendanceRows = [], isLoading } = useAttendance(selectedEventId ? { eventId: selectedEventId } : undefined);
  const recordAttendance = useRecordAttendance();

  const presentCount = attendanceRows.filter(r => r.present).length;
  const absentCount = attendanceRows.filter(r => !r.present).length;
  const avgRate = attendanceRows.length > 0 ? Math.round((presentCount / attendanceRows.length) * 100) : 0;

  const absentMembers = members.filter(m => Number(m.attendanceRate || 0) < 80);
  const filteredAbsentees = absentMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const grouped: Record<string, { eventTitle: string; date: string; present: number; absent: number }> = {};
  attendanceRows.forEach(r => {
    const key = `${r.eventId}-${r.date}`;
    if (!grouped[key]) grouped[key] = { eventTitle: r.eventTitle || 'Event', date: r.date, present: 0, absent: 0 };
    if (r.present) grouped[key].present++;
    else grouped[key].absent++;
  });
  const summaryRows = Object.values(grouped);

  const startMarking = () => {
    // Pre-fill from existing records if any
    const initial: Record<string, boolean> = {};
    if (attendanceRows.length > 0) {
      attendanceRows.forEach(r => { if (r.memberId) initial[r.memberId] = r.present; });
    } else {
      members.forEach(m => { initial[m.id] = false; });
    }
    setMarkedPresent(initial);
    setMarkingMode(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedEventId) return;
    const records = Object.entries(markedPresent).map(([memberId, present]) => ({ memberId, present }));
    try {
      await recordAttendance.mutateAsync({ eventId: selectedEventId, records });
      toast.success(`Attendance saved for ${records.filter(r => r.present).length} present members`);
      setMarkingMode(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance');
    }
  };

  const toggleAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    members.forEach(m => { updated[m.id] = present; });
    setMarkedPresent(updated);
  };

  const markedPresentCount = Object.values(markedPresent).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage service attendance</p>
        </div>
        {selectedEventId && !markingMode && (
          <button onClick={startMarking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
            <ClipboardCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark Attendance</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Rate', value: `${avgRate}%`, icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Present', value: presentCount, icon: Users, color: 'bg-secondary text-secondary-foreground' },
          { label: 'Absent', value: absentCount, icon: UserX, color: 'bg-destructive/10 text-destructive' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-3 lg:p-4 shadow-sm text-center">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <select value={selectedEventId} onChange={e => { setSelectedEventId(e.target.value); setMarkingMode(false); }}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-card text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title} — {new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {/* ── Marking Mode ─────────────────────────────────────────────────── */}
      {markingMode && selectedEventId && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Mark Attendance</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{markedPresentCount} of {members.length} marked present</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAll(true)} className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">All Present</button>
              <button onClick={() => toggleAll(false)} className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">All Absent</button>
            </div>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {members.map(member => {
              const isPresent = markedPresent[member.id] ?? false;
              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.cellGroup || member.ministry || '—'}</p>
                  </div>
                  <button onClick={() => setMarkedPresent(prev => ({ ...prev, [member.id]: !isPresent }))}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isPresent ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isPresent ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
            <button onClick={() => setMarkingMode(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSaveAttendance} disabled={recordAttendance.isPending}
              className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
              {recordAttendance.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Attendance
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Records Table ─────────────────────────────────────────────────── */}
      {!markingMode && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Attendance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Event / Member</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Present</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Absent</th>
                  {selectedEventId && <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : selectedEventId ? (
                  attendanceRows.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No attendance recorded yet.{' '}
                      <button onClick={startMarking} className="text-primary underline">Mark attendance now</button>
                    </td></tr>
                  ) : attendanceRows.map(r => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-xs">{r.memberName || 'Member'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-3 text-center text-xs text-primary font-medium">{r.present ? '✓' : '—'}</td>
                      <td className="px-4 py-3 text-center text-xs text-destructive">{!r.present ? '✗' : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${r.present ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive'}`}>
                          {r.present ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : summaryRows.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">No attendance records yet. Select an event to view or mark attendance.</td></tr>
                ) : summaryRows.map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-xs">{row.eventTitle}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(row.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-3 text-center text-xs text-primary font-medium">{row.present}</td>
                    <td className="px-4 py-3 text-center text-xs text-destructive">{row.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Frequent Absentees ────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <button onClick={() => setShowAbsentees(!showAbsentees)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
          <h2 className="text-sm font-semibold flex items-center gap-2"><UserX className="w-4 h-4 text-destructive" />Frequent Absentees ({absentMembers.length})</h2>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAbsentees ? 'rotate-180' : ''}`} />
        </button>
        {showAbsentees && (
          <div className="px-4 pb-4">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search members..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="space-y-2">
              {filteredAbsentees.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.cellGroup} · {member.ministry}</p>
                  </div>
                  <span className="text-xs font-medium text-destructive">{Number(member.attendanceRate || 0).toFixed(0)}%</span>
                </div>
              ))}
              {filteredAbsentees.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No members with low attendance</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
