import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col items-center justify-center text-center space-y-6">
        {/* Glow effect background */}
        <div className="absolute w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/15 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-md scale-110 opacity-30 animate-pulse-slow" />
            <Shield className="h-16 w-16 text-primary relative z-10 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none">
              Cyber<span className="text-primary text-glow">Shield</span>
            </h1>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase pt-2 animate-pulse">
              Securing Environment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
