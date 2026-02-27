import { useState } from 'react';
import { members } from '@/data/mockData';
import { Users, Plus, Search, UserPlus, Phone, Mail, ChevronDown, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ministries = ['Worship Team', 'Ushering', 'Media Team', 'Hospitality', 'Choir', 'Prayer Team', 'Youth Outreach'];
const cellGroups = ['Faith Cell', 'Hope Cell', 'Grace Cell', 'Love Cell'];

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMember, setViewMember] = useState<string | null>(null);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery);
    const matchMinistry = filterMinistry === 'all' || m.ministry === filterMinistry;
    const matchGroup = filterGroup === 'all' || m.cellGroup === filterGroup;
    return matchSearch && matchMinistry && matchGroup;
  });

  const membersByMinistry = ministries.map(min => ({
    ministry: min,
    count: members.filter(m => m.ministry === min).length,
  })).sort((a, b) => b.count - a.count);

  const selectedMember = viewMember ? members.find(m => m.id === viewMember) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Member Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, view, and manage youth members</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church">
          <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Add Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{members.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Members</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{cellGroups.length}</p>
          <p className="text-[10px] text-muted-foreground">Cell Groups</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent-foreground flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{ministries.length}</p>
          <p className="text-[10px] text-muted-foreground">Ministries</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-chart-5/10 text-chart-5 flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{Math.round(members.reduce((s, m) => s + m.attendanceRate, 0) / members.length)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Attendance</p>
        </div>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Register New Member</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Full Name" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input placeholder="Phone Number" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input placeholder="Email Address" type="email" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <input type="date" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="relative">
              <select className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">Select Ministry</option>
                {ministries.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">Select Cell Group</option>
                {cellGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">Register Member</button>
          </div>
        </motion.div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Member Details</h3>
            <button onClick={() => setViewMember(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
              {selectedMember.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 flex-1">
              <div><p className="text-[10px] text-muted-foreground">Full Name</p><p className="text-sm font-medium">{selectedMember.name}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedMember.phone}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedMember.email}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Ministry</p><p className="text-sm font-medium">{selectedMember.ministry}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Cell Group</p><p className="text-sm font-medium">{selectedMember.cellGroup}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Attendance</p><p className="text-sm font-medium">{selectedMember.attendanceRate}%</p></div>
              <div><p className="text-[10px] text-muted-foreground">Joined</p><p className="text-sm font-medium">{new Date(selectedMember.joinedDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ministry Distribution */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Ministry Distribution</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {membersByMinistry.map(m => (
            <div key={m.ministry} className="p-2.5 bg-muted/30 rounded-xl text-center">
              <p className="text-sm font-bold">{m.count}</p>
              <p className="text-[10px] text-muted-foreground truncate">{m.ministry}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Ministries</option>
                  {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Groups</option>
                  {cellGroups.map(g => <option key={g} value={g}>{g}</option>)}
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
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ministry</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Cell Group</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Attendance</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{member.phone}</td>
                  <td className="px-4 py-3 text-xs">{member.ministry}</td>
                  <td className="px-4 py-3 text-xs">{member.cellGroup}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      member.attendanceRate >= 80 ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive'
                    }`}>{member.attendanceRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setViewMember(member.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;
