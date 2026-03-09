import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FloatingChatbot } from '@/components/FloatingChatbot';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps { children: ReactNode; title?: string; }

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function AppLayout({ children, title }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <motion.header
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="h-16 border-b border-border bg-card flex items-center justify-between px-6 lg:px-8 pl-16 lg:pl-8 shrink-0"
        >
          <div>
            {title && (
              <motion.h1 key={title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xl font-semibold text-foreground">
                {title}
              </motion.h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-40 text-foreground placeholder:text-muted-foreground" />
            </div>
            <ThemeToggle />
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
          </div>
        </motion.header>
        
        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              ref={notificationRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-16 right-6 lg:right-8 z-50 w-80 bg-card border border-border rounded-lg shadow-xl"
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingChatbot />
    </div>
  );
}
