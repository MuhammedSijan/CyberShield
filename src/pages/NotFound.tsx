import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 space-y-6">
      <div className="p-5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500 animate-bounce">
        <ShieldAlert className="h-16 w-16" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Intruder Alert! (404)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          The security perimeter was breached: the page you are trying to access does not exist or has been moved to another quadrant.
        </p>
      </div>

      <Link
        to="/dashboard"
        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
      </Link>
    </div>
  );
};
