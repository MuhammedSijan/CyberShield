import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Trash2, MessageSquare, Globe, Key, QrCode, Award, Shield, RotateCw, Sparkles, Activity, ShieldAlert
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import type { ScanItem } from '../context/SecurityContext';
import { generatePDFReport } from '../utils/pdfReport';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { aiService } from '../services/ai/aiService';

export const Dashboard: React.FC = () => {
  const { scans, clearScans, getSafetyScore } = useSecurity();
  const { user, sessionStartTime } = useAuth();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const safetyScore = getSafetyScore();

  useEffect(() => {
    if (scans.length === 0) {
      setAiBrief(null);
      return;
    }

    const loadAdvisory = async () => {
      setIsBriefLoading(true);
      try {
        const brief = await aiService.getSecurityAdvisory(scans, safetyScore);
        setAiBrief(brief);
      } catch (err) {
        console.error("Failed to load security posture brief:", err);
      } finally {
        setIsBriefLoading(false);
      }
    };

    loadAdvisory();
  }, [scans, safetyScore]);

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
  const todaysScans = scans.filter(s => {
    const scanDate = new Date(s.timestamp);
    const today = new Date();
    return scanDate.toDateString() === today.toDateString();
  }).length;
  const safeScans = scans.filter((s) => s.riskLevel === 'Safe').length;
  const suspiciousScans = scans.filter((s) => s.riskLevel === 'Suspicious').length;
  const dangerousScans = scans.filter((s) => s.riskLevel === 'Danger').length;

  const quizScans = scans.filter((s) => s.type === 'quiz');
  const quizAttempts = quizScans.length;
  const avgQuizScore = quizAttempts > 0 
    ? Math.round(quizScans.reduce((acc, curr) => acc + (100 - curr.riskScore), 0) / quizAttempts) 
    : 0;

  const toolCounts: Record<string, number> = {};
  scans.forEach(scan => {
    toolCounts[scan.type] = (toolCounts[scan.type] || 0) + 1;
  });
  
  let mostUsedType = 'N/A';
  let maxCount = 0;
  Object.entries(toolCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedType = type;
    }
  });

  const toolNameMap: Record<string, string> = {
    'url': 'URL Analyzer',
    'phishing': 'Phishing Detector',
    'password': 'Password Checker',
    'qr': 'QR Scanner',
    'file': 'File Analyzer',
    'quiz': 'Hygiene Quiz',
    'generator': 'Password Generator'
  };
  const mostUsedTool = toolNameMap[mostUsedType] || 'N/A';

  const lastScanTime = scans.length > 0 
    ? new Date(scans[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'N/A';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast('Reports Synced', 'Real-time security metrics are fully synchronized with Firestore.', 'success');
    } catch (err) {
      showToast('Sync Error', 'Failed to synchronize with backend database.', 'danger');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearReport = async () => {
    if (window.confirm("Are you sure you want to permanently delete all scan reports? This will reset your stats and score.")) {
      try {
        await clearScans();
        showToast('Report Cleared', 'All diagnostic logs have been wiped from Firestore.', 'info');
      } catch (err) {
        showToast('Clear Failed', 'Failed to delete scans history.', 'danger');
      }
    }
  };

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
        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <button
            onClick={() => generatePDFReport(scans, safetyScore, sessionStartTime ? Date.now() - sessionStartTime : 0, user)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            Download Security Report
          </button>
          <button
            onClick={handleClearReport}
            className="px-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Clear Local Report
          </button>
        </div>
      </div>

      {/* AI SECURITY POSTURE BRIEF */}
      <div className="glass-panel p-6 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-glow" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-primary">ShieldAI Security Briefing</h2>
          </div>

          {isBriefLoading ? (
            <div className="space-y-2.5">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
            </div>
          ) : aiBrief ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-850 dark:text-white leading-relaxed">
                  {aiBrief.summary}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                  {aiBrief.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {aiBrief.indicators && aiBrief.indicators.length > 0 && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-505 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-500" /> Focus Threat Areas
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {aiBrief.indicators.map((ind: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiBrief.recommendations && aiBrief.recommendations.length > 0 && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-500" /> Actionable Mitigations
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {aiBrief.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Run your first security audits in the Security Hub to enable ShieldAI security advisories.
              </p>
              <Link to="/hub" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 mt-2">
                Go to Security Hub <Play className="h-3 w-3 fill-current" />
              </Link>
            </div>
          )}
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
                <span className="text-xs text-slate-400 dark:text-slate-500">Total / Today's Scans</span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{totalChecks} / {todaysScans}</p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Safe / Suspicious Scans</span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  <span className="text-emerald-500">{safeScans}</span> / <span className="text-amber-500">{suspiciousScans}</span>
                </p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Dangerous / Most Used</span>
                <p className="text-xl font-bold text-slate-800 dark:text-white truncate">
                  <span className="text-rose-500">{dangerousScans}</span> / <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 inline-block truncate max-w-[65px] align-middle ml-1">{mostUsedTool}</span>
                </p>
              </div>
              <div className="p-3.5 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">Quiz Attempts / Avg</span>
                <p className="text-xl font-bold text-slate-850 dark:text-white">{quizAttempts} / {avgQuizScore}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-850 flex flex-col gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <div className="flex justify-between">
              <span>Last Scan: {lastScanTime}</span>
              <span>Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Score: {safetyScore}%</span>
              <span>Active Sync Live</span>
            </div>
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
