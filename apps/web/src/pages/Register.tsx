import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isAdminRole } from '@/contexts/AuthContext';
import { Church, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
      return;
    }
    navigate('/member', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="relative h-56 sm:h-64 lg:h-auto lg:flex-1 overflow-hidden">
        <img src="/images/IMG_20250308_122824.jpg" alt="PEFA Youth community" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-church-teal-dark/80 via-church-teal-dark/60 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl gradient-gold shadow-gold flex items-center justify-center mx-auto mb-4">
              <Church className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground">Join PEFA Youth</h1>
            <p className="text-sm lg:text-base text-primary-foreground/80 mt-1 max-w-xs mx-auto">
              Become part of our vibrant community of young believers
            </p>
          </motion.div>
        </div>
      </div>

      {/* Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-4 -mt-6 lg:mt-0 relative z-10 lg:flex lg:items-center lg:justify-center"
      >
        <div className="max-w-sm w-full mx-auto lg:max-w-md">
          <div className="bg-card rounded-2xl shadow-church border border-border p-6 lg:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Create Your Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Join the community — it's free</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm gradient-primary text-primary-foreground shadow-church hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="py-6 text-center lg:hidden">
        <p className="text-xs text-muted-foreground">© 2026 PEFA Youth Church</p>
      </div>
    </div>
  );
};

export default Register;
