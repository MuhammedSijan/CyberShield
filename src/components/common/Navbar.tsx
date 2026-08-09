import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Sun, Moon, LogOut, User as UserIcon, Settings, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, guestMode, isAuthenticated, logout } = useAuth();

  // Scroll detection to reduce height & increase glass background blur opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  // Click outside listener for user profile dropdown
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Security Hub', path: '/hub' },
    { name: 'Security Report', path: '/dashboard' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogoutAction = () => {
    logout();
    showToast('Logged Out', 'Your session indicators have been cleared.', 'info');
    navigate('/auth');
  };

  // Context-aware Start Check button selector
  const renderNavbarCTA = (isMobileLayout: boolean = false) => {
    const path = location.pathname;
    const commonClass = isMobileLayout
      ? "mt-2 w-full py-2.5 text-center text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
      : "px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5";

    if (path === '/hub') {
      return (
        <Link
          to="/home"
          className={`${commonClass} text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800`}
        >
          Back to Home
        </Link>
      );
    }

    // Default CTA: Start Check
    return (
      <Link
        to="/hub"
        className={`${commonClass} text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/10`}
      >
        Start Check
      </Link>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'py-2 glass-panel bg-opacity-85 dark:bg-opacity-70 shadow-lg shadow-slate-900/5'
          : 'py-4 bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors border border-primary/10">
              <Shield className="h-5.5 w-5.5 text-primary" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">
              Cyber<span className="text-primary text-glow-primary">Shield</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'text-slate-650 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.span
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Dropdown Selector */}
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  {guestMode || !user?.photoURL ? (
                    <div className="h-5.5 w-5.5 rounded bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black text-[9px]">
                      {guestMode ? 'G' : (user?.firstName ? user.firstName.substring(0, 1).toUpperCase() : 'U')}
                    </div>
                  ) : (
                    <img src={user.photoURL} alt="Avatar" className="h-5.5 w-5.5 rounded object-cover" />
                  )}
                  <span>{guestMode ? 'Guest User' : `${user?.firstName}`}</span>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/95 backdrop-blur-md py-1.5 z-55"
                    >
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2.5 text-left">
                        {guestMode || !user?.photoURL ? (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                            {guestMode ? 'G' : (user?.firstName ? user.firstName.substring(0, 1).toUpperCase() : 'U')}
                          </div>
                        ) : (
                          <img src={user.photoURL} alt="Avatar" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {guestMode ? 'Guest Evaluator' : `${user?.firstName} ${user?.lastName}`}
                          </p>
                          <p className="text-[9px] text-slate-455 dark:text-slate-500 truncate mt-0.5">
                            {guestMode ? 'Local browser session' : user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Items */}
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center gap-2"
                      >
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" /> Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center gap-2"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" /> Settings
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center gap-2"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-slate-400" /> Security Reports
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-850 my-1" />

                      <button
                        onClick={handleLogoutAction}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Log Out Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {renderNavbarCTA()}
          </div>

          {/* Mobile responsive toggle */}
          <div className="md:hidden flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t-0 bg-opacity-95 dark:bg-opacity-95 py-2 px-4 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-850'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-slate-100 dark:bg-slate-850 my-2" />

              {isAuthenticated && (
                <div className="px-3.5 py-2 bg-slate-100/50 dark:bg-slate-850/40 rounded-xl space-y-2 mb-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Active Session: <strong className="text-slate-800 dark:text-slate-200">{guestMode ? 'Guest Mode' : user?.firstName}</strong>
                  </div>
                  <button
                    onClick={handleLogoutAction}
                    className="w-full py-2 border border-rose-500/25 hover:bg-rose-500/10 text-rose-500 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="h-4 w-4" /> Log Out Session
                  </button>
                </div>
              )}

              {renderNavbarCTA(true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
