import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Pill,
  AlertTriangle,
  UtensilsCrossed,
  Apple,
  Activity,
  Syringe,
  Heart,
  Settings,
  User,
  Menu,
  LogOut,
  ClipboardList,
  Dumbbell,
  CreditCard,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Health Profile', url: '/profile', icon: User },
      { title: 'Health Survey', url: '/survey', icon: ClipboardList },
    ],
  },
  {
    label: 'Health',
    items: [
      { title: 'Medicines', url: '/medicines', icon: Pill },
      { title: 'Interactions', url: '/interactions', icon: AlertTriangle },
      { title: 'Emergency Card', url: '/emergency', icon: CreditCard },
    ],
  },
  {
    label: 'Nutrition & Fitness',
    items: [
      { title: 'Diet Planner', url: '/diet', icon: UtensilsCrossed },
      { title: 'Food Tracker', url: '/food-tracker', icon: Apple },
      { title: 'Fitness', url: '/fitness', icon: Dumbbell },
    ],
  },
  {
    label: 'Wellness',
    items: [
      { title: 'Wellness', url: '/wellness', icon: Activity },
      { title: 'Vaccinations', url: '/vaccinations', icon: Syringe },
      { title: "Women's Health", url: '/womens-health', icon: Heart },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-card border border-border shadow-sm"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </motion.button>

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // On desktop, keep sidebar pinned and full-height without affecting flow.
          'lg:sticky lg:top-0 lg:z-auto'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">Medora</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </motion.button>
        </div>

        {!collapsed && user && (
          <div className="border-b border-sidebar-border px-4 py-2">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        'text-sidebar-foreground hover:bg-sidebar-accent',
                        collapsed && 'justify-center px-2'
                      )}
                      activeClassName="bg-primary text-white hover:bg-primary/90"
                      onClick={() => setMobileOpen(false)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-xl bg-primary"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          style={{ zIndex: 0 }}
                          aria-hidden
                        />
                      )}
                      <item.icon className="relative z-10 h-5 w-5 shrink-0" />
                      {!collapsed && <span className="relative z-10">{item.title}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/settings"
            className={cn(
              'mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed && 'justify-center px-2'
            )}
            onClick={() => setMobileOpen(false)}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </aside>
    </>
  );
}
