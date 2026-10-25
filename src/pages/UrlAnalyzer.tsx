import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ShieldCheck, AlertTriangle,
  RefreshCw, ShieldAlert, Sparkles,
  Link as LinkIcon, Server, ShieldCheck as LockIcon, Hash, ArrowRight
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';
import { aiService } from '../services/ai/aiService';

export const UrlAnalyzer: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempUrlEval, setTempUrlEval] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const handleSampleClick = (url: string) => {
    setUrlInput(url);
    setResult(null);
    setShowResults(false);
  };

  const executeAnalysis = async (url: string, isAuto = false) => {
    setIsLoading(true);
    setResult(null);
    setShowResults(false);

    try {
      const lowerUrl = url.toLowerCase();
      let localRiskScore = 10;
      const hasHttps = lowerUrl.startsWith('https://');
      const keywords = ['paypal', 'secure', 'bank', 'login', 'update', 'verify', 'account', 'signin', 'support', 'recovery'];
      const foundKeywords = keywords.filter(kw => lowerUrl.includes(kw));
      const cleanHost = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      const isIp = /^[0-9.]+$/.test(cleanHost.replace(/:[0-9]+$/, ''));
      const subdomains = cleanHost.split('.').length - 2;
      const subCount = subdomains > 0 ? subdomains : 0;
      const typosquatting = lowerUrl.includes('0') || lowerUrl.includes('rn') || lowerUrl.includes('vv') || lowerUrl.includes('g00g') || lowerUrl.includes('paypaI');

      if (!hasHttps) localRiskScore += 25;
      if (foundKeywords.length > 0) localRiskScore += foundKeywords.length * 15;
      if (isIp) localRiskScore += 35;
      if (typosquatting) localRiskScore += 30;
      if (subCount > 3) localRiskScore += 20;

      // Call AI Service which handles backend functions securely
      const aiResponse = await aiService.analyzeUrl(url);

      let uiRiskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
      if (aiResponse.riskLevel === 'HIGH' || aiResponse.riskLevel === 'CRITICAL') {
        uiRiskLevel = 'Danger';
      } else if (aiResponse.riskLevel === 'MEDIUM') {
        uiRiskLevel = 'Suspicious';
      }

      // Determine composite score
      const compositeScore = Math.max(localRiskScore, aiResponse.confidence || 0);

      const finalEval = {
        riskScore: Math.min(compositeScore, 100),
        riskLevel: uiRiskLevel,
        hasHttps,
        domainLength: cleanHost.length,
        suspiciousKeywords: foundKeywords,
        isIpAddress: isIp,
        typosquattingDetected: typosquatting,
        subdomainCount: subCount,
        explanation: aiResponse.explanation,
        aiData: aiResponse
      };

      setTempUrlEval({ url, isAuto, finalEval });
    } catch (err: any) {
      console.error("URL scan failed:", err);
      showToast('Scan Error', err.message || 'Could not complete security inspection.', 'danger');
      setIsLoading(false);
    }
  };

  const handleScanComplete = () => {
    if (!tempUrlEval) return;
    const { url, isAuto, finalEval } = tempUrlEval;

    setResult(finalEval);
    setIsLoading(false);
    setShowResults(true);

    const cleanTarget = url.length > 30 ? `${url.substring(0, 30)}...` : url;
    addScan('url', cleanTarget, finalEval.riskLevel === 'Safe' ? 'Verified Clean' : 'Suspect Domain', finalEval.riskScore, finalEval.riskLevel);

    if (!isAuto) {
      showToast('Analysis Completed', 'Domain security indicators processed.', 'success');
    }
  };

  const handleAnalyze = () => {
    if (!urlInput.trim()) {
      showToast('Input Required', 'Please enter a URL to analyze.', 'warning');
      return;
    }
    executeAnalysis(urlInput);
  };

  useEffect(() => {
    setShowResults(false);
  }, [urlInput]);

  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      setUrlInput(queryUrl);
      executeAnalysis(queryUrl, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getRiskDetails = (level: string) => {
    switch (level) {
      case 'Danger':
        return {
          icon: <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
          color: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
          label: 'Critical Hazard / Threat Flagged'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
          color: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          label: 'Caution / Anomalous Domain'
        };
      default:
        return {
          icon: <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
          color: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
          label: 'Clean Signature / Low Risk'
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
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Globe className="h-3.5 w-3.5" />
          <span>Web Safety Inspector</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          URL Safety Analyzer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Inspect hyperlink destinations client-side for SSL validity, typosquatting variants, raw IP hosts, and deceptive subdomain structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT & SAMPLES (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Target URL Address
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter URL to analyze (e.g., https://secure-login.com)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                {isLoading ? 'Scanning...' : 'Scan URL'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Client-side heuristics & protocol checks</span>
              {urlInput && (
                <button
                  onClick={() => {
                    setUrlInput('');
                    setResult(null);
                    setShowResults(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Clear input
                </button>
              )}
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Test Domains
            </h3>
            <div className="space-y-2">
              {samples.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(sample)}
                  className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left flex items-center justify-between text-xs border-slate-200 dark:border-slate-800 transition-all group"
                >
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate pr-4 group-hover:text-primary transition-colors">
                    {sample}
                  </span>
                  <span className="text-[11px] text-primary font-semibold shrink-0">
                    Load domain →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {isLoading && (
              <StepProgressScanner onComplete={handleScanComplete} />
            )}

            {!isLoading && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 py-16"
              >
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Ready for Inspection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Enter any web address or select a test domain to initiate client-side security analysis.
                </p>
              </motion.div>
            )}

            {!isLoading && showResults && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
              >
                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${getRiskDetails(result.riskLevel).bg}`}>
                  <div>{getRiskDetails(result.riskLevel).icon}</div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Security Status
                    </span>
                    <h3 className={`text-sm font-bold ${getRiskDetails(result.riskLevel).color}`}>
                      {getRiskDetails(result.riskLevel).label}
                    </h3>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Factor</span>
                    <span className={`${getRiskDetails(result.riskLevel).color} font-bold`}>
                      {result.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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

                {/* Diagnostic Indicators */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Diagnostic Telemetry
                  </h4>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LockIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">HTTPS Transport</span>
                      </div>
                      <span className={`font-semibold ${result.hasHttps ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {result.hasHttps ? 'Valid SSL' : 'Unencrypted HTTP'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Hostname Length</span>
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {result.domainLength} chars
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Server className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Raw IP Host</span>
                      </div>
                      <span className={`font-semibold ${result.isIpAddress ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {result.isIpAddress ? 'Direct IP Address' : 'Standard DNS Host'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Typosquatting</span>
                      </div>
                      <span className={`font-semibold ${result.typosquattingDetected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {result.typosquattingDetected ? 'Suspicious Variant' : 'Clean'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Subdomain Count</span>
                      </div>
                      <span className={`font-semibold ${result.subdomainCount > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {result.subdomainCount} {result.subdomainCount === 1 ? 'level' : 'levels'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keywords list */}
                {result.suspiciousKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Flagged Brand Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suspiciousKeywords.map((kw: string, idx: number) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold uppercase">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Analysis</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      Confidence: {result.aiData?.confidence ?? 100}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UrlAnalyzer;
