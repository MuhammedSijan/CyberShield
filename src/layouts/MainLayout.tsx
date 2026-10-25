import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ShieldAssistant } from '../components/common/ShieldAssistant';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('cfg_anim') === 'false' || localStorage.getItem('cfg_motion') === 'true';
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setReduceMotion(localStorage.getItem('cfg_anim') === 'false' || localStorage.getItem('cfg_motion') === 'true');
    };
    window.addEventListener('storage', handleSettingsUpdate);
    window.addEventListener('settings-update', handleSettingsUpdate);
    return () => {
      window.removeEventListener('storage', handleSettingsUpdate);
      window.removeEventListener('settings-update', handleSettingsUpdate);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <MotionConfig transition={{ duration: reduceMotion ? 0 : 0.18 }}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
        {/* Subtle, calm static grid without moving particles or animations */}
        <div className="absolute inset-0 cyber-grid pointer-events-none opacity-50 dark:opacity-40 z-0" />

        {/* Navigation header */}
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* Dynamic page transition content */}
        <main className="flex-grow flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-grow flex flex-col w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />

        {/* Slide-over AI Security Assistant Drawer */}
        <ShieldAssistant />
      </div>
    </MotionConfig>
  );
};
