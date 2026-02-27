import { NavLink, useLocation } from 'react-router-dom';
import { Church, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
];

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-gold shadow-gold flex items-center justify-center">
              <Church className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <span className="text-base font-bold text-primary">YouthConnect</span>
              <span className="hidden sm:block text-[10px] text-muted-foreground -mt-0.5">Youth Church</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="px-5 py-2 rounded-xl text-sm font-semibold gradient-primary text-primary-foreground shadow-church hover:shadow-lg transition-all"
            >
              Sign In
            </NavLink>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-card overflow-hidden"
            >
              <nav className="p-3 space-y-1">
                {navLinks.map(({ to, label }) => {
                  const isActive = location.pathname === to;
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {label}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-church-teal-dark text-primary-foreground/90 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                  <Church className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-base font-bold">YouthConnect</span>
              </div>
              <p className="text-sm text-primary-foreground/60 leading-relaxed">
                Empowering the next generation through faith, fellowship, and community.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map(({ to, label }) => (
                  <li key={to}>
                    <NavLink to={to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Connect</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li>Sunday Service: 9:00 AM</li>
                <li>Youth Fellowship: Fridays 6PM</li>
                <li>Bible Study: Tuesdays 6:30PM</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li>Pefa Church, Kajiado</li>
                <li>info@youthconnect.church</li>
                <li>+254 700 000 000</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/40">
            © 2026 YouthConnect Church. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
