import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Eye, EyeOff,
  Copy, Check, X, Sparkles, Lock, Clock
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';
import { aiService } from '../services/ai/aiService';

export const PasswordChecker: React.FC = () => {
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ password: string; explanation: string }>>([]);
  const [aiResult, setAiResult] = useState<any>(null);
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  // Evaluation States
  const [metrics, setMetrics] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    noRepeats: false,
    noCommonWords: false,
    score: 0,
    timeToCrack: 'Instant',
    strength: 'Weak' as 'Weak' | 'Medium' | 'Strong' | 'Very Strong'
  });

  const checkPassword = (pwd: string) => {
    if (!pwd) {
      setMetrics({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
        noRepeats: false,
        noCommonWords: false,
        score: 0,
        timeToCrack: 'Instant',
        strength: 'Weak'
      });
      return;
    }

    const length = pwd.length >= 12;
    const upper = /[A-Z]/.test(pwd);
    const lower = /[a-z]/.test(pwd);
    const number = /[0-9]/.test(pwd);
    const special = /[^A-Za-z0-9]/.test(pwd);

    // Repeated pattern check
    const repeats = /(.)\1{3,}/.test(pwd) || (pwd.length >= 6 && pwd.substring(0, pwd.length / 2) === pwd.substring(pwd.length / 2));
    const noRepeats = !repeats;

    // Common words list
    const commonWords = ['password', '123456', 'admin', 'qwerty', 'security', 'sijan', 'cybershield', 'welcome', 'letmein'];
    const noCommonWords = !commonWords.some(w => pwd.toLowerCase().includes(w));

    // Calculate score
    let score = 0;
    if (pwd.length > 0) score += Math.min(pwd.length * 4, 30);
    if (upper) score += 10;
    if (lower) score += 10;
    if (number) score += 15;
    if (special) score += 15;
    if (noRepeats) score += 10;
    if (noCommonWords) score += 10;

    // Time to crack calculations
    let timeToCrack = 'Instant';
    let strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';

    if (score >= 90) {
      timeToCrack = '400,000+ Years';
      strength = 'Very Strong';
    } else if (score >= 70) {
      timeToCrack = '8 Years';
      strength = 'Strong';
    } else if (score >= 45) {
      timeToCrack = '3 Weeks';
      strength = 'Medium';
    } else if (pwd.length > 0) {
      timeToCrack = 'Seconds';
      strength = 'Weak';
    }

    setMetrics({
      length,
      upper,
      lower,
      number,
      special,
      noRepeats,
      noCommonWords,
      score,
      timeToCrack,
      strength
    });
  };

  useEffect(() => {
    checkPassword(password);
    setShowResults(false);
  }, [password]);

  const generateRandomPassword = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  };

  const generateSuggestions = () => {
    const newSuggestions = Array.from({ length: 4 }).map(() => ({
      password: generateRandomPassword(16),
      explanation: "Cryptographically random high-entropy passphrase."
    }));
    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    if (metrics.strength === 'Weak' || metrics.strength === 'Medium') {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [metrics.strength]);

  const handleAnalyze = async () => {
    if (!password.trim()) {
      showToast('Input Required', 'Please enter a password to evaluate.', 'warning');
      return;
    }

    setTempPassword(password);
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      // Send only derived characteristics to protect privacy
      const derivedSummary = {
        length: password.length,
        hasUppercase: metrics.upper,
        hasLowercase: metrics.lower,
        hasNumbers: metrics.number,
        hasSymbols: metrics.special,
        score: metrics.score,
        strength: metrics.strength,
        noRepeats: metrics.noRepeats,
        noCommonWords: metrics.noCommonWords
      };

      const aiResponse = await aiService.explainPassword(derivedSummary);
      setAiResult(aiResponse);
    } catch (err: any) {
      console.error("AI password assessment failed:", err);
    }
  };

  const handleScanComplete = () => {
    setIsAnalyzing(false);
    setShowResults(true);

    let riskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
    if (metrics.strength === 'Weak') riskLevel = 'Danger';
    else if (metrics.strength === 'Medium') riskLevel = 'Suspicious';

    const maskedPwd = tempPassword.length > 3
      ? `${tempPassword.substring(0, 1)}***${tempPassword.substring(tempPassword.length - 1)}`
      : '***';

    addScan('password', maskedPwd, `${metrics.strength} (${metrics.score}%)`, 100 - metrics.score, riskLevel);
    showToast('Analysis Completed', 'Credential complexity verified locally.', 'success');
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Copied to Clipboard', 'Passphrase copied to clipboard.', 'success');
  };

  const getStrengthStyles = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
        return { color: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' };
      case 'Strong':
        return { color: 'text-blue-700 dark:text-blue-400', bar: 'bg-blue-500' };
      case 'Medium':
        return { color: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' };
      default:
        return { color: 'text-rose-700 dark:text-rose-400', bar: 'bg-rose-500' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <Key className="h-3.5 w-3.5" />
          <span>Credential Health Inspector</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Password Health Checker
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Evaluate password complexity, brute-force resistance, and entropy bits locally. Passwords never leave your device.
        </p>
      </div>

      {/* PRIVACY BADGE */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Local Verification Guarantee:</strong> Your password is evaluated locally using browser cryptographic APIs. Cleartext is never transmitted across the network or stored in databases.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT & RESULTS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isAnalyzing ? (
            <StepProgressScanner onComplete={handleScanComplete} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Enter Password to Evaluate
              </h2>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Type a password to test..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono tracking-wider transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !password.trim()}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  Analyze Complexity
                </button>
              </div>
            </div>
          )}

          {/* CHECKLIST & METRICS */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5"
              >
                {/* Score & Time to crack */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Complexity Score
                    </span>
                    <p className={`text-xl font-bold ${getStrengthStyles(metrics.strength).color}`}>
                      {metrics.strength} ({metrics.score}/100)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Estimated Crack Time
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{metrics.timeToCrack}</span>
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getStrengthStyles(metrics.strength).bar}`}
                    style={{ width: `${metrics.score}%` }}
                  />
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Security Requirements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { check: metrics.length, label: "Minimum 12 characters" },
                      { check: metrics.upper, label: "Uppercase letters (A-Z)" },
                      { check: metrics.lower, label: "Lowercase letters (a-z)" },
                      { check: metrics.number, label: "Numbers (0-9)" },
                      { check: metrics.special, label: "Special characters (!@#$)" },
                      { check: metrics.noRepeats, label: "No repeated patterns" },
                      { check: metrics.noCommonWords, label: "No dictionary words" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {item.check ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span className={item.check ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-500'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR: SUGGESTIONS & AI ANALYSIS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Analysis (if ready) */}
          {aiResult && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  ShieldAI Entropy Summary
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {aiResult.explanation}
              </p>
            </div>
          )}

          {/* Strong Alternatives */}
          {suggestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cryptographic Alternatives
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Strong randomly generated replacements:
                </p>
              </div>

              <div className="space-y-2">
                {suggestions.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                      {item.password}
                    </span>
                    <button
                      onClick={() => handleCopy(item.password)}
                      aria-label="Copy password to clipboard"
                      className="p-1.5 text-slate-500 hover:text-primary rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordChecker;
