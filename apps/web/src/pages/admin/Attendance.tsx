import { useState } from 'react';
import { attendanceRecords, members, events } from '@/data/mockData';
import { Search, Calendar, Users, UserX, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Attendance = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAbsentees, setShowAbsentees] = useState(false);

  const filteredRecords = selectedEvent === 'all'
    ? attendanceRecords
    : attendanceRecords.filter(r => r.eventId === selectedEvent);

  const totalPresent = filteredRecords.reduce((sum, r) => sum + r.present, 0);
  const totalAbsent = filteredRecords.reduce((sum, r) => sum + r.absent, 0);
  const avgRate = filteredRecords.length > 0
    ? Math.round(filteredRecords.reduce((sum, r) => sum + (r.present / r.total) * 100, 0) / filteredRecords.length)
    : 0;

  // Mock absentees
  const absentMembers = members.filter(m => m.attendanceRate < 80);
  const filteredAbsentees = absentMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage service attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Rate', value: `${avgRate}%`, icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Total Present', value: totalPresent, icon: Users, color: 'bg-secondary text-secondary-foreground' },
          { label: 'Total Absent', value: totalAbsent, icon: UserX, color: 'bg-destructive/10 text-destructive' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-3 lg:p-4 shadow-sm text-center"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="relative">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-card text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="all">All Events</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {/* Attendance Records */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Attendance Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Present</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Absent</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-xs">{record.eventTitle}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(record.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-primary font-medium">{record.present}</td>
                  <td className="px-4 py-3 text-center text-xs text-destructive">{record.absent}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium">{Math.round((record.present / record.total) * 100)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absentees Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAbsentees(!showAbsentees)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <UserX className="w-4 h-4 text-destructive" />
            Frequent Absentees ({absentMembers.length})
          </h2>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAbsentees ? 'rotate-180' : ''}`} />
        </button>
        {showAbsentees && (
          <div className="px-4 pb-4">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
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
                  <span className="text-xs font-medium text-destructive">{member.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
