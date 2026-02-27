import { useState } from 'react';
import { useMember, useUpdateMember } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Mail, Users, Church, Calendar, Edit, Loader2, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { data: member, isLoading } = useMember(user?.memberId);
  const updateMember = useUpdateMember();
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const attendanceHistory = member?.attendanceHistory ?? [];
  const presentCount = attendanceHistory.filter(a => a.present).length;
  const memberName = member?.name ?? user?.name ?? 'Member';
  const initials = memberName.split(' ').map((n: string) => n[0]).join('');
  const attendanceRate = member?.attendanceRate
    ? `${member.attendanceRate}%`
    : attendanceHistory.length > 0
      ? `${Math.round((presentCount / attendanceHistory.length) * 100)}%`
      : '0%';

  const startEdit = () => {
    setEditPhone(member?.phone || '');
    setEditEmail(member?.email || user?.email || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user?.memberId) return;
    try {
      await updateMember.mutateAsync({ id: user.memberId, data: { phone: editPhone, email: editEmail } });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile header + Stats */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm text-center"
          >
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                {initials}
              </span>
            </div>
            <h1 className="text-lg font-bold">{memberName}</h1>
            <p className="text-sm text-muted-foreground">{member?.ministry ?? ''}</p>
            {!editing ? (
              <button onClick={startEdit} className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Edit className="w-3 h-3" />
                Edit Profile
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <X className="w-3 h-3" />
                Cancel
              </button>
            )}
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Attendance', value: attendanceRate, color: 'bg-secondary' },
              { label: 'Services', value: `${presentCount}`, color: 'bg-accent/10' },
              { label: 'Member Since', value: member?.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en', { month: 'short', year: '2-digit' }) : '—', color: 'bg-muted' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${stat.color} rounded-xl p-3 text-center`}
              >
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: Info + Attendance */}
        <div className="lg:col-span-2 space-y-5">
          {/* Edit Form */}
          {editing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <h2 className="text-sm font-semibold mb-3">Edit Contact Info</h2>
              <p className="text-xs text-muted-foreground mb-4">You can update your phone number and email address. Contact your secretary to update other details.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+254 7xx xxx xxx" type="tel"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="you@email.com" type="email"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button onClick={handleSave} disabled={updateMember.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
                    {updateMember.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Cards */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold px-4 pt-4 pb-2">Personal Information</h2>
            {[
              { icon: Phone, label: 'Phone', value: member?.phone ?? '—' },
              { icon: Mail, label: 'Email', value: member?.email ?? user?.email ?? '—' },
              { icon: Church, label: 'Ministry', value: member?.ministry ?? '—' },
              { icon: Users, label: 'Cell Group', value: member?.cellGroup ?? '—' },
              { icon: Calendar, label: 'Joined', value: member?.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
            ].map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < 4 ? 'border-b border-border' : ''}`}
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance History */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold px-4 pt-4 pb-2">Attendance History</h2>
            {attendanceHistory.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No attendance records yet
              </div>
            ) : (
              attendanceHistory.map((record, i) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < attendanceHistory.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{record.eventTitle ?? 'Service'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    record.present
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {record.present ? '✓ Present' : '✗ Absent'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
