import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Pill, AlertTriangle, UtensilsCrossed, Apple, Activity, Syringe, Heart, MessageCircle, Settings, User, Menu, X, LogOut, ClipboardList, Dumbbell, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Health Profile', url: '/profile', icon: User },
  { title: 'Health Survey', url: '/survey', icon: ClipboardList },
  { title: 'Medicines', url: '/medicines', icon: Pill },
  { title: 'Interactions', url: '/interactions', icon: AlertTriangle },
  { title: 'Diet Planner', url: '/diet', icon: UtensilsCrossed },
  { title: 'Food Tracker', url: '/food-tracker', icon: Apple },
  { title: 'Fitness', url: '/fitness', icon: Dumbbell },
  { title: 'Wellness', url: '/wellness', icon: Activity },
  { title: 'Vaccinations', url: '/vaccinations', icon: Syringe },
  { title: "Women's Health", url: '/womens-health', icon: Heart },
  { title: 'Emergency Card', url: '/emergency', icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </motion.button>

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'lg:relative lg:z-auto'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">HealthSync</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground ml-auto"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </motion.button>
        </div>

        {!collapsed && user && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.url;
            return (
              <motion.div key={item.url} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                <NavLink
                  to={item.url} end
                  className={cn('relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-sidebar-foreground hover:bg-sidebar-accent', collapsed && 'justify-center px-2')}
                  activeClassName="bg-sidebar-accent text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors', collapsed && 'justify-center px-2')}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </aside>
    </>
  );
}
