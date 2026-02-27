import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAdminRole } from '@/contexts/AuthContext';
import { Church, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import churchHero from '@/assets/church-hero.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigate based on role returned from server
        const { user } = await import('@/contexts/AuthContext').then(m => ({ user: null }));
        // Slight delay to let state settle, then read from context
        setTimeout(() => navigate(isAdminRole as any), 0);
      }
    } catch {}
    setLoading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Invalid email or password. Check your credentials and try again.');
      return;
    }
    // The LoginRoute wrapper in App.tsx handles redirect once user is set
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
            <p className="text-sm lg:text-base text-primary-foreground/80 mt-1">PEFA Youth Church Management</p>
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
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
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

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm gradient-primary text-primary-foreground shadow-church hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 p-4 bg-muted rounded-xl text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground mb-2">Default accounts:</p>
              <p><span className="font-medium">Member:</span> grace@pefayouth.org / member123</p>
              <p><span className="font-medium">Admin:</span> admin@pefayouth.org / admin123</p>
              <p><span className="font-medium">Finance:</span> finance@pefayouth.org / finance123</p>
              <p><span className="font-medium">Secretary:</span> secretary@pefayouth.org / secretary123</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="py-6 text-center lg:hidden">
        <p className="text-xs text-muted-foreground">© 2026 PEFA Youth Church</p>
      </div>
    </div>
  );
};

export default Login;
