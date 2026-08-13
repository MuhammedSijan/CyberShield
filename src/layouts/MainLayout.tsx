import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CyberBackground } from '../components/common/CyberBackground';
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
    <MotionConfig transition={{ duration: reduceMotion ? 0 : undefined }}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-305 relative overflow-hidden">
        {/* Network particle dynamic canvas background */}
        <CyberBackground />

        {/* Cyber grid layout */}
        <div className="absolute inset-0 cyber-grid pointer-events-none z-0 animate-grid-scroll" />
        
        {/* Background ambient glowing rings */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/10 rounded-full blur-[130px] pointer-events-none z-0 animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/10 w-[450px] h-[450px] bg-indigo-500/5 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-glow" />

        {/* Navigation header */}
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* Dynamic page transition content */}
        <main className="flex-grow flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-grow flex flex-col w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating AI Security Assistant Widget */}
        <ShieldAssistant />
      </div>
    </MotionConfig>
  );
};
