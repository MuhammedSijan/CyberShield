import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ShieldCheck, AlertTriangle, 
  RefreshCw, ShieldAlert, Sparkles,
  Link as LinkIcon, Server, ShieldCheck as LockIcon, Hash
} from 'lucide-react';
import { urlSamples } from '../data/mockData';
import type { UrlMockSample } from '../data/mockData';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';

export const UrlAnalyzer: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<UrlMockSample['evaluation'] | null>(null);
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const handleSampleClick = (url: string) => {
    setUrlInput(url);
    setResult(null);
    setShowResults(false);
  };

  const executeAnalysis = (url: string, isAuto = false) => {
    setIsLoading(true);
    setResult(null);
    setShowResults(false);

    setTimeout(() => {
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      const matchedKey = Object.keys(urlSamples).find(key => 
        url.toLowerCase().includes(key) || cleanUrl.toLowerCase().includes(key)
      );

      let finalEval: UrlMockSample['evaluation'];

      if (matchedKey) {
        finalEval = urlSamples[matchedKey].evaluation;
      } else {
        const lowerUrl = url.toLowerCase();
        let riskScore = 10;
        let hasHttps = lowerUrl.startsWith('https://');
        const keywords = ['paypal', 'secure', 'bank', 'login', 'update', 'verify', 'account', 'signin', 'support', 'recovery'];
        const foundKeywords = keywords.filter(kw => lowerUrl.includes(kw));
        const cleanHost = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        const isIp = /^[0-9.]+$/.test(cleanHost.replace(/:[0-9]+$/, ''));
        const subdomains = cleanHost.split('.').length - 2;
        const subCount = subdomains > 0 ? subdomains : 0;
        const typosquatting = lowerUrl.includes('0') || lowerUrl.includes('rn') || lowerUrl.includes('vv') || lowerUrl.includes('g00g') || lowerUrl.includes('paypaI');

        if (!hasHttps) riskScore += 25;
        if (foundKeywords.length > 0) riskScore += foundKeywords.length * 15;
        if (isIp) riskScore += 35;
        if (typosquatting) riskScore += 30;
        if (subCount > 3) riskScore += 20;

        const riskLevel = riskScore > 60 ? 'Danger' : riskScore > 25 ? 'Suspicious' : 'Safe';

        finalEval = {
          riskScore: Math.min(riskScore, 100),
          riskLevel,
          hasHttps,
          domainLength: cleanHost.length,
          suspiciousKeywords: foundKeywords,
          isIpAddress: isIp,
          typosquattingDetected: typosquatting,
          subdomainCount: subCount,
          explanation: `URL evaluated client-side. Casing keywords matched: ${foundKeywords.length}. Protocol matches standard configurations: ${hasHttps ? 'Yes (HTTPS)' : 'No (HTTP)'}.`
        };
      }

      setResult(finalEval);
      setIsLoading(false);
      setShowResults(true);

      // Log in session report
      addScan('url', url, finalEval.riskLevel === 'Safe' ? 'Verified Safe' : 'Threat Flags Found', finalEval.riskScore, finalEval.riskLevel);
      showToast(isAuto ? 'Auto Scan Completed' : 'Scan Completed', 'Domain safety metrics evaluated.', 'success');
    }, 1200);
  };

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrlInput(urlParam);
      executeAnalysis(urlParam, true);
    }
  }, [searchParams]);

  const handleAnalyze = () => {
    if (!urlInput.trim()) {
      showToast('Input Required', 'Please enter a URL to analyze.', 'warning');
      return;
    }
    executeAnalysis(urlInput);
  };

  useEffect(() => {
    // Hide old results if the user edits the URL text
    setShowResults(false);
  }, [urlInput]);

  const getRiskDetails = (level: string) => {
    switch (level) {
      case 'Danger':
        return {
          icon: <ShieldAlert className="h-8 w-8 text-rose-500" />,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10 border-rose-500/25',
          label: 'Danger / Threat Blocked'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/25',
          label: 'Caution / Suspicious Domain'
        };
      default:
        return {
          icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/25',
          label: 'Safe / Clean Signature'
        };
    }
  };

  const samples = [
    'google.com',
    'http://secure-paypal-login-update.com',
    'https://g00gle-security-alert.net/auth',
    'http://192.168.1.154/login.php',
    'https://mail.sub.dev.support.microsoft.updates-security-system.com/status'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">URL Safety Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Inspect target hyperlink addresses for security certificates, character anomalies, subdomain spoofing, and malicious keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT BOX */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Inspect Link</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL to analyze (e.g. secure-paypal-billing.com)..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-400 dark:placeholder-slate-650"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? 'Scanning...' : 'Scan URL'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setUrlInput('');
                  setResult(null);
                  setShowResults(false);
                }}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Interactive Test Domains
            </h4>
            <div className="flex flex-col gap-2">
              {samples.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample)}
                  className="p-3.5 rounded-xl border glass-panel glass-panel-hover text-left flex items-center justify-between text-xs border-slate-200 dark:border-slate-800/60"
                >
                  <span className="font-mono text-slate-700 dark:text-slate-350 truncate pr-4">{sample}</span>
                  <span className="text-[10px] text-primary font-bold shrink-0">Select Domain</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center"
              >
                <SkeletonLoader count={1} className="py-4" />
                <p className="text-xs text-center text-slate-455 dark:text-slate-500 mt-4">
                  Evaluating DNS metadata & parsing domain tokens...
                </p>
              </motion.div>
            )}

            {!isLoading && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-full mb-4">
                  <Globe className="h-8 w-8 text-slate-405 dark:text-slate-650" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Awaiting URL</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px]">
                  Input a domain address or click a mock shortcut to execute diagnostic scans.
                </p>
              </motion.div>
            )}

            {!isLoading && showResults && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6"
              >
                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${getRiskDetails(result.riskLevel).bg}`}>
                  <div>{getRiskDetails(result.riskLevel).icon}</div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Domain Health</span>
                    <h4 className={`text-base font-bold leading-none ${getRiskDetails(result.riskLevel).color}`}>
                      {getRiskDetails(result.riskLevel).label}
                    </h4>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Factor</span>
                    <span className={`${getRiskDetails(result.riskLevel).color} font-bold`}>{result.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        result.riskLevel === 'Danger' 
                          ? 'bg-rose-500' 
                          : result.riskLevel === 'Suspicious' 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Metrics report list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Diagnostic Reports
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LockIcon className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">HTTPS Status</span>
                      </div>
                      <span className={`font-bold uppercase ${result.hasHttps ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {result.hasHttps ? 'Secure SSL' : 'Unencrypted'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Domain Length</span>
                      </div>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {result.domainLength} chars
                      </span>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Raw IP Host</span>
                      </div>
                      <span className={`font-bold ${result.isIpAddress ? 'text-rose-500' : 'text-slate-500'}`}>
                        {result.isIpAddress ? 'Detected' : 'Standard DNS'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Typosquatting Check</span>
                      </div>
                      <span className={`font-bold ${result.typosquattingDetected ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {result.typosquattingDetected ? 'Flagged Pattern' : 'Clean'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Subdomains Count</span>
                      </div>
                      <span className={`font-bold ${result.subdomainCount > 3 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {result.subdomainCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keywords list */}
                {result.suspiciousKeywords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Flagged Brand Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suspiciousKeywords.map((kw, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase font-bold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation Placeholder */}
                <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 border border-indigo-500/10 rounded-xl relative overflow-hidden space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">AI Threat Explanation</span>
                  </div>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                    {result.explanation}
                  </p>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded w-fit mt-1">
                    AI Integration Coming Soon
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
