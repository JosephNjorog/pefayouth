import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, Film, FileText, LogOut, Menu, X, Church,
  Receipt, Wallet, BarChart3, Heart, Calendar, Newspaper, UserPlus, ClipboardList
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

interface SidebarItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  section?: string;
}

const getSidebarItems = (role: UserRole): SidebarItem[] => {
  if (role === 'finance_admin') {
    return [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/finance', icon: DollarSign, label: 'Payments', section: 'Finance' },
      { to: '/admin/offerings', icon: Heart, label: 'Offerings & Tithes' },
      { to: '/admin/expenses', icon: Receipt, label: 'Expenses' },
      { to: '/admin/budget', icon: Wallet, label: 'Budget Planning' },
      { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    ];
  }
  if (role === 'secretary') {
    return [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/members', icon: UserPlus, label: 'Members', section: 'Management' },
      { to: '/admin/event-management', icon: Calendar, label: 'Events' },
      { to: '/admin/newsletters', icon: Newspaper, label: 'Newsletters' },
      { to: '/admin/attendance', icon: Users, label: 'Attendance' },
      { to: '/admin/media', icon: Film, label: 'Media' },
      { to: '/admin/records', icon: FileText, label: 'Records' },
    ];
  }
  // super_admin gets everything
  return [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/members', icon: UserPlus, label: 'Members', section: 'Secretary' },
    { to: '/admin/event-management', icon: Calendar, label: 'Events' },
    { to: '/admin/newsletters', icon: Newspaper, label: 'Newsletters' },
    { to: '/admin/attendance', icon: Users, label: 'Attendance' },
    { to: '/admin/media', icon: Film, label: 'Media' },
    { to: '/admin/records', icon: FileText, label: 'Records' },
    { to: '/admin/finance', icon: DollarSign, label: 'Payments', section: 'Finance' },
    { to: '/admin/offerings', icon: Heart, label: 'Offerings & Tithes' },
    { to: '/admin/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/admin/budget', icon: Wallet, label: 'Budget Planning' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  secretary: 'Secretary',
};

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarItems = getSidebarItems(user?.role || 'super_admin');

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items: SidebarItem[], onClick?: () => void) => {
    let lastSection: string | undefined;
    return items.map(({ to, icon: Icon, label, section }) => {
      const showSection = section && section !== lastSection;
      if (section) lastSection = section;
      return (
        <div key={to}>
          {showSection && (
            <p className="text-[10px] uppercase tracking-wider text-primary-foreground/40 font-semibold mt-4 mb-1 px-4">
              {section}
            </p>
          )}
          <NavLink
            to={to}
            end={to === '/admin'}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? 'bg-accent/20 text-accent'
                : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </NavLink>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 gradient-hero text-primary-foreground shrink-0">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Church className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg">PEFA Youth</h1>
              <p className="text-[10px] opacity-70">{roleLabels[user?.role || 'super_admin']}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {renderNavItems(sidebarItems)}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[10px] opacity-60">{roleLabels[user?.role || 'super_admin']}</p>
            </div>
            <NotificationBell variant="light" />
            <ThemeToggle className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" />
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-xl text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-sm font-semibold text-primary">PEFA Youth</h2>
                <p className="text-[10px] text-muted-foreground">{roleLabels[user?.role || 'super_admin']}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ThemeToggle />
              <button onClick={logout} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-foreground/40 z-50" onClick={() => setMobileMenuOpen(false)} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 gradient-hero text-primary-foreground z-50 flex flex-col">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Church className="w-6 h-6 text-accent" />
                    <span className="font-bold">PEFA Youth</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                  {renderNavItems(sidebarItems, () => setMobileMenuOpen(false))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} className="max-w-6xl mx-auto">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
