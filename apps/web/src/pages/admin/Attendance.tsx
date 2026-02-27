import { useState } from 'react';
import { Search, Users, UserX, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAttendance, useEvents, useMembers } from '@/hooks/useApi';

const Attendance = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAbsentees, setShowAbsentees] = useState(false);

  const { data: events = [] } = useEvents();
  const { data: members = [] } = useMembers();
  const { data: attendanceRows = [], isLoading } = useAttendance(selectedEventId ? { eventId: selectedEventId } : undefined);

  // For overall stats: group attendance by event
  const presentCount = attendanceRows.filter(r => r.present).length;
  const absentCount = attendanceRows.filter(r => !r.present).length;
  const avgRate = attendanceRows.length > 0 ? Math.round((presentCount / attendanceRows.length) * 100) : 0;

  // Members with low attendance
  const absentMembers = members.filter(m => Number(m.attendanceRate || 0) < 80);
  const filteredAbsentees = absentMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Group attendance by event/date for the summary table
  const grouped: Record<string, { eventTitle: string; date: string; present: number; absent: number }> = {};
  attendanceRows.forEach(r => {
    const key = `${r.eventId}-${r.date}`;
    if (!grouped[key]) grouped[key] = { eventTitle: r.eventTitle || 'Event', date: r.date, present: 0, absent: 0 };
    if (r.present) grouped[key].present++;
    else grouped[key].absent++;
  });
  const summaryRows = Object.values(grouped);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage service attendance</p>
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
        <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-card text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

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
                attendanceRows.map(r => (
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
                <tr><td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">No attendance records yet. Select an event to view details.</td></tr>
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
