import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepProgressScannerProps {
  onComplete: () => void;
  duration?: number;
}

export const StepProgressScanner: React.FC<StepProgressScannerProps> = ({ onComplete, duration = 1800 }) => {
  const [stepLabel, setStepLabel] = useState('Preparing Sandbox...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      { pct: 20, text: 'Preparing Sandbox...' },
      { pct: 50, text: 'Scanning Threat Vectors...' },
      { pct: 80, text: 'Analyzing Signatures...' },
      { pct: 100, text: 'Compiling Final Result...' }
    ];

    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const currentProgress = Math.floor(progressRatio * 100);
      setProgress(currentProgress);

      // Find current step text based on progress
      const match = steps.find(s => currentProgress <= s.pct) || steps[steps.length - 1];
      setStepLabel(match.text);

      if (progressRatio >= 1) {
        clearInterval(interval);
        setTimeout(onComplete, 180); // Small buffer before trigger completion
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete, duration]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 glass-panel rounded-3xl border-primary/20 space-y-6 max-w-md mx-auto relative overflow-hidden bg-white dark:bg-[#0d1424]/40">
      <div className="absolute inset-0 bg-primary/2 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />
      
      <div className="relative">
        <RefreshCw className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: '2.5s' }} />
        <Shield className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="space-y-2 text-center w-full">
        <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Active Scan Process</p>
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white transition-all duration-300 h-5">
          {stepLabel}
        </h4>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      <span className="text-[10px] font-mono font-bold text-primary">{progress}% Complete</span>
    </div>
  );
};
export default StepProgressScanner;
