import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Play, User, LogOut, Church, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

const navItems = [
  { to: '/member', icon: Home, label: 'Home' },
  { to: '/member/events', icon: Calendar, label: 'Events' },
  { to: '/member/media', icon: Play, label: 'Media' },
  { to: '/member/notifications', icon: Bell, label: 'Updates' },
  { to: '/member/profile', icon: User, label: 'Profile' },
];

export const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm shrink-0 sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-gold shadow-gold flex items-center justify-center">
              <Church className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">PEFA Youth</h2>
              <p className="text-xs text-muted-foreground">Member Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to ||
              (to !== '/member' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout + Theme */}
        <div className="p-3 border-t border-border space-y-1">
          <ThemeToggle variant="label" className="w-full" />
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header - always visible on mobile, simplified on desktop */}
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile logo */}
              <div className="lg:hidden">
                <h2 className="text-sm font-semibold text-primary">PEFA Youth</h2>
                <p className="text-xs text-muted-foreground">Welcome, {user?.name?.split(' ')[0]}</p>
              </div>
              {/* Desktop breadcrumb-style */}
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold">
                  {location.pathname === '/member' && 'Dashboard'}
                  {location.pathname === '/member/events' && 'Events & Calendar'}
                  {location.pathname.startsWith('/member/events/') && 'Event Details'}
                  {location.pathname === '/member/media' && 'Media Library'}
                  {location.pathname === '/member/notifications' && 'Notifications'}
                  {location.pathname === '/member/profile' && 'My Profile'}
                </h2>
                <p className="text-xs text-muted-foreground">Welcome back, {user?.name?.split(' ')[0]}</p>
              </div>
            </div>
            {/* Mobile: notifications + theme + logout */}
            <div className="lg:hidden flex items-center gap-1">
              <NotificationBell />
              <ThemeToggle />
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            {/* Desktop user badge */}
            <div className="hidden lg:flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Member</p>
              </div>
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-8 max-w-6xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Bottom navigation - mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border bottom-nav-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to ||
              (to !== '/member' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
