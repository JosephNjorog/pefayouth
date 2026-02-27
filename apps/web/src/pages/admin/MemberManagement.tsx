import { useState } from 'react';
import { Users, Search, UserPlus, ChevronDown, Eye, Loader2, Edit, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '@/hooks/useApi';
import { toast } from 'sonner';

const ministries = ['Worship Team', 'Ushering', 'Media Team', 'Hospitality', 'Choir', 'Prayer Team', 'Youth Outreach'];
const cellGroups = ['Faith Cell', 'Hope Cell', 'Grace Cell', 'Love Cell'];

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMemberId, setViewMemberId] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', joinedDate: '', ministry: '', cellGroup: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', joinedDate: '', ministry: '', cellGroup: '' });

  const { data: members = [], isLoading } = useMembers({
    search: searchQuery || undefined,
    ministry: filterMinistry !== 'all' ? filterMinistry : undefined,
    cellGroup: filterGroup !== 'all' ? filterGroup : undefined,
  });
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const selectedMember = viewMemberId ? members.find((m) => m.id === viewMemberId) : null;
  const editingMember = editMemberId ? members.find((m) => m.id === editMemberId) : null;

  const startEdit = (member: typeof members[0]) => {
    setEditMemberId(member.id);
    setEditForm({ name: member.name, phone: member.phone || '', email: member.email || '', joinedDate: member.joinedDate || '', ministry: member.ministry || '', cellGroup: member.cellGroup || '' });
    setViewMemberId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberId || !editForm.name) return;
    try {
      await updateMember.mutateAsync({ id: editMemberId, data: editForm });
      toast.success('Member updated successfully');
      setEditMemberId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success('Member deleted');
      if (viewMemberId === id) setViewMemberId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete member');
    }
  };

  const membersByMinistry = ministries.map((min) => ({
    ministry: min,
    count: members.filter((m) => m.ministry === min).length,
  })).sort((a, b) => b.count - a.count);

  const avgAttendance = members.length
    ? Math.round(members.reduce((s, m) => s + Number(m.attendanceRate || 0), 0) / members.length)
    : 0;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await createMember.mutateAsync(form);
      toast.success('Member registered successfully');
      setForm({ name: '', phone: '', email: '', joinedDate: '', ministry: '', cellGroup: '' });
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to register member');
    }
  };

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          <p className="text-lg font-bold">{isLoading ? '—' : members.length}</p>
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
          <p className="text-lg font-bold">{avgAttendance}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Attendance</p>
        </div>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Register New Member</h3>
          <form onSubmit={handleAddMember}>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name *" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email Address" type="email" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input type="date" value={form.joinedDate} onChange={e => setForm(f => ({ ...f, joinedDate: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <div className="relative">
                <select value={form.ministry} onChange={e => setForm(f => ({ ...f, ministry: e.target.value }))} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="">Select Ministry</option>
                  {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={form.cellGroup} onChange={e => setForm(f => ({ ...f, cellGroup: e.target.value }))} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="">Select Cell Group</option>
                  {cellGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={createMember.isPending} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                {createMember.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Register Member
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {selectedMember && !editMemberId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Member Details</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(selectedMember)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => setViewMemberId(null)} className="text-xs text-muted-foreground hover:text-foreground ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
              {selectedMember.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 flex-1">
              <div><p className="text-[10px] text-muted-foreground">Full Name</p><p className="text-sm font-medium">{selectedMember.name}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedMember.phone || '—'}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedMember.email || '—'}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Ministry</p><p className="text-sm font-medium">{selectedMember.ministry || '—'}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Cell Group</p><p className="text-sm font-medium">{selectedMember.cellGroup || '—'}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Attendance</p><p className="text-sm font-medium">{Number(selectedMember.attendanceRate || 0).toFixed(0)}%</p></div>
              {selectedMember.joinedDate && <div><p className="text-[10px] text-muted-foreground">Joined</p><p className="text-sm font-medium">{new Date(selectedMember.joinedDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>}
            </div>
          </div>
        </motion.div>
      )}

      {editingMember && editMemberId && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Edit Member — {editingMember.name}</h3>
            <button onClick={() => setEditMemberId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleUpdate}>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name *" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email Address" type="email" className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input type="date" value={editForm.joinedDate} onChange={e => setEditForm(f => ({ ...f, joinedDate: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <div className="relative">
                <select value={editForm.ministry} onChange={e => setEditForm(f => ({ ...f, ministry: e.target.value }))} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="">Select Ministry</option>
                  {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={editForm.cellGroup} onChange={e => setEditForm(f => ({ ...f, cellGroup: e.target.value }))} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="">Select Cell Group</option>
                  {cellGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setEditMemberId(null)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={updateMember.isPending} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                {updateMember.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

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

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)} className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
                  <option value="all">All Ministries</option>
                  {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="px-3 py-2 pr-8 rounded-lg border border-input bg-background text-xs appearance-none">
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
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No members found</td></tr>
              ) : members.map(member => (
                <tr key={member.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{member.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs">{member.ministry || '—'}</td>
                  <td className="px-4 py-3 text-xs">{member.cellGroup || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(member.attendanceRate || 0) >= 80 ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive'}`}>
                      {Number(member.attendanceRate || 0).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setViewMemberId(member.id); setEditMemberId(null); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => startEdit(member)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
