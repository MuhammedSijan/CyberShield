import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, MessageSquare, Globe, Key, QrCode, Award, Shield, 
  RotateCw, Sparkles, ShieldAlert, Download, CheckCircle2,
  FileText, ChevronRight, Info
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import type { ScanItem } from '../context/SecurityContext';
import { generatePDFReport } from '../utils/pdfReport';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { aiService } from '../services/ai/aiService';

export const Dashboard: React.FC = () => {
  const { scans, clearScans, getSafetyScore } = useSecurity();
  const { user, guestMode, sessionStartTime } = useAuth();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const safetyScore = getSafetyScore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = guestMode ? 'Guest' : (user?.firstName || 'User');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (scans.length === 0) {
      setAiBrief(null);
      setAiError(false);
      return;
    }

    const loadAdvisory = async () => {
      setIsBriefLoading(true);
      setAiError(false);
      try {
        const brief = await aiService.getSecurityAdvisory(scans, safetyScore);
        setAiBrief(brief);
      } catch (err) {
        console.warn("ShieldAI posture brief unavailable:", err);
        setAiError(true);
      } finally {
        setIsBriefLoading(false);
      }
    };

    loadAdvisory();
  }, [scans, safetyScore]);

  const getToolIcon = (type: ScanItem['type']) => {
    switch (type) {
      case 'phishing':
        return <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'url':
        return <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'password':
        return <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'qr':
        return <QrCode className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'file':
        return <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Award className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getRiskBadge = (level: ScanItem['riskLevel']) => {
    switch (level) {
      case 'Danger':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60';
      case 'Suspicious':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60';
      default:
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60';
    }
  };

  // Metrics calculations
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
  
  let mostUsedType = 'None';
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
  const mostUsedToolName = totalChecks > 0 ? (toolNameMap[mostUsedType] || mostUsedType) : 'No scans yet';

  const lastScanTime = scans.length > 0 
    ? new Date(scans[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'None recorded';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Reports Synced', 'Real-time security metrics are synchronized.', 'success');
    } catch {
      showToast('Sync Error', 'Failed to synchronize with database.', 'danger');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearReport = async () => {
    if (window.confirm("Are you sure you want to permanently clear your scan history for this session?")) {
      try {
        await clearScans();
        showToast('Report Cleared', 'All diagnostic logs have been cleared.', 'info');
      } catch {
        showToast('Clear Failed', 'Failed to delete scans history.', 'danger');
      }
    }
  };

  let grade = 'A+';
  let gradeColor = 'text-emerald-600 dark:text-emerald-400';
  if (totalChecks === 0) {
    grade = 'Pending';
    gradeColor = 'text-slate-500 dark:text-slate-400';
  } else if (safetyScore < 40) {
    grade = 'Critical (D)';
    gradeColor = 'text-rose-600 dark:text-rose-400';
  } else if (safetyScore < 70) {
    grade = 'Caution (C)';
    gradeColor = 'text-amber-600 dark:text-amber-400';
  } else if (safetyScore < 90) {
    grade = 'Sentinel (B)';
    gradeColor = 'text-blue-600 dark:text-blue-400';
  }

  return (
    <div className="space-y-8 py-4 text-left max-w-7xl mx-auto">
      {/* 1. PERSONALIZED SESSION GREETING & DASHBOARD HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Authenticated Security Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {totalChecks > 0 
              ? `You have executed ${totalChecks} client-side security audits in this session.` 
              : 'Zero active scans recorded. Execute diagnostic checks in the Security Hub to establish your security baseline.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={() => generatePDFReport(scans, safetyScore, sessionStartTime ? Date.now() - sessionStartTime : 0, user)}
            disabled={totalChecks === 0}
            className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Audit PDF</span>
          </button>

          {totalChecks > 0 && (
            <button
              onClick={handleClearReport}
              className="px-3 py-2 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SHIELD AI SECURITY POSTURE BRIEF */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              ShieldAI Security Advisory Brief
            </h2>
          </div>
          {aiError && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Info className="h-3 w-3" /> AI offline; local scanners active
            </span>
          )}
        </div>

        {isBriefLoading ? (
          <div className="space-y-2.5 py-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-5/6" />
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        ) : aiBrief ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {aiBrief.summary}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                {aiBrief.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {aiBrief.indicators && aiBrief.indicators.length > 0 && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Focus Threat Areas
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {aiBrief.indicators.map((ind: string, idx: number) => (
                      <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiBrief.recommendations && aiBrief.recommendations.length > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Actionable Mitigations
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {aiBrief.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ShieldAI advisory engine is on standby. Run your first security audit on a website link, message, or password to compile personalized intelligence and vulnerability guidance.
              </p>
            </div>
            <Link
              to="/hub"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5"
            >
              Start First Scan <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 3. CORE DASHBOARD OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: CYBER SAFETY SCORE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Security Rating</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated assessment based on active scan outcomes.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-slate-100 dark:stroke-slate-800" 
                  strokeWidth="8" fill="transparent" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  className={totalChecks === 0 ? "stroke-slate-300 dark:stroke-slate-700" : "stroke-primary"} 
                  strokeWidth="8" fill="transparent"
                  strokeDasharray="251.2"
                  style={{
                    strokeDashoffset: totalChecks === 0 ? 251.2 : 251.2 - (251.2 * safetyScore) / 100,
                    strokeLinecap: 'round',
                    transition: 'stroke-dashoffset 0.8s ease-out'
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalChecks === 0 ? '--' : `${safetyScore}%`}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${gradeColor}`}>
                  {grade}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400">Calculated Score</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {totalChecks === 0 ? 'Not initialized' : `${safetyScore}/100`}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: totalChecks === 0 ? '0%' : `${safetyScore}%` }}
              />
            </div>
            {totalChecks === 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
                Zero baseline: Run audits to compute rating
              </p>
            )}
          </div>
        </div>

        {/* CARD 2: ACTIVITY SUMMARY (FIXED LABELS & NO CLIPPING) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Activity Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Diagnostics tally for active session.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total / Today</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{totalChecks} / {todaysScans}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Safe / Suspicious</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  <span className="text-emerald-600 dark:text-emerald-400">{safeScans}</span>
                  <span className="text-slate-400 dark:text-slate-600 mx-1">/</span>
                  <span className="text-amber-600 dark:text-amber-400">{suspiciousScans}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Dangerous Flagged</span>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{dangerousScans}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Most Used Tool</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {mostUsedToolName}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Last Scan Time:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{lastScanTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Quiz Training:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {quizAttempts > 0 ? `${quizAttempts} tests (${avgQuizScore}% avg)` : 'No attempts'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Session Mode:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{guestMode ? 'Guest Mode' : 'Authenticated'}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: RECENT ACTIVITIES (PRESERVED ZERO-STATE SCAFFOLDING) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Audits</h3>
              <span className="text-[11px] font-mono text-slate-400">{totalChecks} items</span>
            </div>

            {totalChecks > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                {scans.map((scan) => (
                  <div key={scan.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getToolIcon(scan.type)}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {scan.target}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block pl-6 mt-0.5">
                        {scan.type.toUpperCase()} • {scan.result}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${getRiskBadge(scan.riskLevel)}`}>
                      {scan.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Shield className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No scan logs recorded yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your inspect history and risk flags will be logged here as you analyze links, files, and messages.
                </p>
              </div>
            )}
          </div>

          <Link
            to="/hub"
            className="mt-4 w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl text-center block transition-all"
          >
            Launch a Security Check
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
