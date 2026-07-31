import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Trash2, MessageSquare, Globe, Key, QrCode, Award, Shield 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import type { ScanItem } from '../context/SecurityContext';
import { generatePDFReport } from '../utils/pdfReport';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { scans, clearScans, getSafetyScore } = useSecurity();
  const { user, sessionStartTime } = useAuth();

  const getToolIcon = (type: ScanItem['type']) => {
    switch (type) {
      case 'phishing':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'url':
        return <Globe className="h-4 w-4 text-emerald-500" />;
      case 'password':
        return <Key className="h-4 w-4 text-amber-500" />;
      case 'qr':
        return <QrCode className="h-4 w-4 text-indigo-500" />;
      default:
        return <Award className="h-4 w-4 text-rose-500" />;
    }
  };

  const getRiskColor = (level: ScanItem['riskLevel']) => {
    switch (level) {
      case 'Danger':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
      case 'Suspicious':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
      default:
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    }
  };

  // 1. EMPTY STATE RENDER
  if (scans.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125 animate-pulse-slow" />
          <div className="p-6 bg-slate-100 dark:bg-slate-900/60 rounded-full border border-slate-200 dark:border-slate-800/80 text-primary relative z-10">
            <Shield className="h-16 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            No Security Report Yet
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            Verify password health, scan links, or complete quizzes to compile your digital exposure metrics.
          </p>
        </div>

        <Link
          to="/hub"
          className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-xl shadow-primary/25 transition-all text-sm flex items-center gap-1.5"
        >
          Start Your First Check <Play className="h-4 w-4 fill-current" />
        </Link>
      </div>
    );
  }

  // 2. ACTIVE DASHBOARD REPORT
  const totalChecks = scans.length;
  const flaggedRisks = scans.filter((s) => s.riskLevel !== 'Safe').length;
  const passwordChecks = scans.filter((s) => s.type === 'password').length;
  const quizChecks = scans.filter((s) => s.type === 'quiz').length;
  const safetyScore = getSafetyScore();

  let grade = 'A+';
  let gradeColor = 'text-emerald-500';
  if (safetyScore < 40) {
    grade = 'Critical (D)';
    gradeColor = 'text-rose-500';
  } else if (safetyScore < 70) {
    grade = 'Caution (C)';
    gradeColor = 'text-amber-500';
  } else if (safetyScore < 90) {
    grade = 'Sentinel (B)';
    gradeColor = 'text-primary';
  }

  return (
    <div className="space-y-8 py-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Security Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review diagnostic logs generated in your active session.</p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => generatePDFReport(scans, safetyScore, sessionStartTime ? Date.now() - sessionStartTime : 0, user)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            Download Security Report
          </button>
          <button
            onClick={clearScans}
            className="px-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Clear Local Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SAFETY SCORE radial SVG */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between gap-6 border-primary/10 lg:col-span-1">
          <div className="space-y-1 text-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Cyber Safety Score</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500">Average security rating from active diagnostics.</p>
          </div>
          
          <div className="relative h-36 w-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="40" 
                className="stroke-slate-200 dark:stroke-slate-850" 
                strokeWidth="8" fill="transparent" 
              />
              <circle 
                cx="50" cy="50" r="40" 
                className="stroke-primary" 
                strokeWidth="8" fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="251.2"
                style={{
                  strokeDashoffset: 251.2 - (251.2 * safetyScore) / 100,
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.8s ease-out'
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{safetyScore}%</span>
              <span className={`text-[10px] uppercase font-bold ${gradeColor}`}>{grade}</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Score Progress</span>
              <span className="text-primary font-bold">{safetyScore}/100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${safetyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-200 dark:border-slate-800 lg:col-span-1">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Activity Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Evaluated Scans</span>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalChecks}</p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Flagged Risk</span>
                <p className={`text-2xl font-bold ${flaggedRisks > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {flaggedRisks}
                </p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Password Evaluated</span>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{passwordChecks}</p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Quiz Completed</span>
                <p className="text-2xl font-bold text-slate-850 dark:text-white">{quizChecks}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-850 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Scan Source: Client Browser</span>
            <span>Security Engine Live</span>
          </div>
        </div>

        {/* LOG LIST */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-200 dark:border-slate-800 lg:col-span-1">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Activities</h3>
            <div className="space-y-3.5 overflow-y-auto max-h-[190px] pr-1">
              {scans.map((scan) => (
                <div key={scan.id} className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {getToolIcon(scan.type)}
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
                        {scan.target}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-455 dark:text-slate-500 block pl-5 mt-0.5">
                      {scan.type.toUpperCase()} • {scan.result}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(scan.riskLevel)}`}>
                    {scan.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/hub"
            className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl text-center block transition-all"
          >
            Perform Another Diagnostic Scan
          </Link>
        </div>
      </div>
    </div>
  );
};
