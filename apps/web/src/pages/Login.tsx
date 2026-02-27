import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Church, Eye, EyeOff, Shield, DollarSign, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import churchHero from '@/assets/church-hero.jpg';

type LoginTab = 'member' | 'admin';

const adminRoles: { role: UserRole; label: string; icon: typeof Shield; desc: string }[] = [
  { role: 'super_admin', label: 'Super Admin', icon: Shield, desc: 'Full system access' },
  { role: 'finance_admin', label: 'Finance Admin', icon: DollarSign, desc: 'Financial management' },
  { role: 'secretary', label: 'Secretary', icon: ClipboardList, desc: 'Events, members & media' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<LoginTab>('member');
  const [adminRole, setAdminRole] = useState<UserRole>('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const role = tab === 'member' ? 'member' : adminRole;
    const success = login(email, password, role);
    if (success) {
      navigate(tab === 'member' ? '/member' : '/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="relative h-56 sm:h-64 lg:h-auto lg:flex-1 overflow-hidden">
        <img src={churchHero} alt="Youth worship" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-church-teal-dark/70 via-church-teal-dark/50 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl gradient-gold shadow-gold flex items-center justify-center mx-auto mb-4">
              <Church className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground">YouthConnect</h1>
            <p className="text-sm lg:text-base text-primary-foreground/80 mt-1">Youth Church Management</p>
          </motion.div>
        </div>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-4 -mt-6 lg:mt-0 relative z-10 lg:flex lg:items-center lg:justify-center"
      >
        <div className="max-w-sm w-full mx-auto lg:max-w-md">
          <div className="bg-card rounded-2xl shadow-church border border-border p-6 lg:p-8">
            {/* Role Tabs */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                onClick={() => setTab('member')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  tab === 'member' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Member
              </button>
              <button
                onClick={() => setTab('admin')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  tab === 'admin' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Admin Role Selector */}
            {tab === 'admin' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5">
                <p className="text-xs font-medium text-muted-foreground mb-2">Select admin role</p>
                <div className="grid grid-cols-3 gap-2">
                  {adminRoles.map(({ role, label, icon: Icon, desc }) => (
                    <button
                      key={role}
                      onClick={() => setAdminRole(role)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        adminRole === role
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-semibold leading-tight">{label}</span>
                      <span className="text-[8px] opacity-60 leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-sm gradient-primary text-primary-foreground shadow-church hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Sign In {tab === 'admin' ? `as ${adminRoles.find(r => r.role === adminRole)?.label}` : 'as Member'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Demo: Enter any email & password to explore
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="py-6 text-center lg:hidden">
        <p className="text-xs text-muted-foreground">© 2026 YouthConnect Church</p>
      </div>
    </div>
  );
};

export default Login;
