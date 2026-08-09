import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, loading]);

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col items-center justify-center text-center space-y-6">
      {/* Glow effect background */}
      <div className="absolute w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center space-y-4 relative z-10"
      >
        <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/15 relative">
          {/* Ambient ring glow */}
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-md scale-110 opacity-30 animate-pulse-slow" />
          <Shield className="h-16 w-16 text-primary relative z-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none">
            Cyber<span className="text-primary text-glow">Shield</span>
          </h1>
          <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase pt-2">
            Protect Before You Click.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default Splash;
