import { currentMember, memberAttendanceHistory } from '@/data/mockData';
import { User, Phone, Mail, Users, Church, Calendar, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const presentCount = memberAttendanceHistory.filter(a => a.status === 'present').length;

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-5">
      {/* Desktop: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile header + Stats */}
        <div className="space-y-5">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm text-center"
          >
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                {currentMember.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h1 className="text-lg font-bold">{currentMember.name}</h1>
            <p className="text-sm text-muted-foreground">{currentMember.ministry}</p>
            <button className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Edit className="w-3 h-3" />
              Edit Profile
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Attendance', value: `${currentMember.attendanceRate}%`, color: 'bg-secondary' },
              { label: 'Services', value: `${presentCount}`, color: 'bg-accent/10' },
              { label: 'Member Since', value: new Date(currentMember.joinedDate).toLocaleDateString('en', { month: 'short', year: '2-digit' }), color: 'bg-muted' },
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
          {/* Info Cards */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold px-4 pt-4 pb-2">Personal Information</h2>
            {[
              { icon: Phone, label: 'Phone', value: currentMember.phone },
              { icon: Mail, label: 'Email', value: currentMember.email },
              { icon: Church, label: 'Ministry', value: currentMember.ministry },
              { icon: Users, label: 'Cell Group', value: currentMember.cellGroup },
              { icon: Calendar, label: 'Joined', value: new Date(currentMember.joinedDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) },
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
            {memberAttendanceHistory.map((record, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < memberAttendanceHistory.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{record.event}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  record.status === 'present'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {record.status === 'present' ? '✓ Present' : '✗ Absent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
