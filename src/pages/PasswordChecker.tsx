import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, ShieldCheck, ShieldAlert, Eye, EyeOff, 
  Copy, RefreshCw, Check, X, Sparkles, Info
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { StepProgressScanner } from '../components/common/StepProgressScanner';

export const PasswordChecker: React.FC = () => {
  const [password, setPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ password: string; explanation: string }>>([]);
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
    
    // Repeated pattern check (e.g. "aaaa" or "123123")
    const repeats = /(.)\1{3,}/.test(pwd) || (pwd.length >= 6 && pwd.substring(0, pwd.length / 2) === pwd.substring(pwd.length / 2));
    const noRepeats = !repeats;

    // Common words list
    const commonWords = ['password', '123456', 'admin', 'qwerty', 'security', 'sijan', 'cybershield', 'welcome', 'letmein'];
    const noCommonWords = !commonWords.some(w => pwd.toLowerCase().includes(w));

    // Calculate score (out of 100)
    let score = 0;
    if (pwd.length > 0) score += Math.min(pwd.length * 4, 30); // Max 30 points for length
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
      timeToCrack = '400,000 Years';
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
    // Hide results if input changes to require re-analysis
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

  // Generate suggestions if strength is not Strong or Very Strong
  const generateSuggestions = () => {
    const newSuggestions = Array.from({ length: 5 }).map(() => {
      const pwdVal = generateRandomPassword(16);
      return {
        password: pwdVal,
        explanation: "Cryptographically secure random character alignment with high entropy."
      };
    });

    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    if (metrics.strength === 'Weak' || metrics.strength === 'Medium') {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [metrics.strength]);

  const handleAnalyze = () => {
    if (!password.trim()) {
      showToast('Input Required', 'Please enter a password to evaluate.', 'warning');
      return;
    }

    setTempPassword(password);
    setIsAnalyzing(true);
    setShowResults(false);
  };

  const handleScanComplete = () => {
    setIsAnalyzing(false);
    setShowResults(true);

    const riskLevel = metrics.strength === 'Very Strong' || metrics.strength === 'Strong'
      ? 'Safe' 
      : metrics.strength === 'Medium' 
      ? 'Suspicious' 
      : 'Danger';

    const riskScore = 100 - metrics.score;

    // Add to context safely - mask password length to preserve absolute privacy
    addScan('password', `${tempPassword.length}-char password`, metrics.strength, riskScore, riskLevel);
    showToast('Analysis Completed', 'Password health evaluated locally.', 'success');
  };



  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Copied to Clipboard', 'Secure passphrase copied successfully.', 'success');
  };

  const getStrengthStyles = (strength: string) => {
    switch (strength) {
      case 'Very Strong':
        return { color: 'text-emerald-500', bg: 'bg-emerald-500', bar: 'w-full bg-emerald-500' };
      case 'Strong':
        return { color: 'text-blue-500', bg: 'bg-blue-500', bar: 'w-3/4 bg-blue-500' };
      case 'Medium':
        return { color: 'text-amber-500', bg: 'bg-amber-500', bar: 'w-1/2 bg-amber-500' };
      default:
        return { color: 'text-rose-500', bg: 'bg-rose-500', bar: 'w-1/4 bg-rose-500' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Password Health Checker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Verify password security strength client-side. Evaluate character complexities and generate safe alternatives.
        </p>
      </div>

      {/* PRIVACY WARNING NOTICE */}
      <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10 dark:bg-blue-500/5 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-800 dark:text-white">🔒 Privacy Notice:</span> Your password is analyzed locally in your browser and is never stored or transmitted.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT BOX */}
        <div className="lg:col-span-2 space-y-6">
          {isAnalyzing ? (
            <StepProgressScanner onComplete={handleScanComplete} />
          ) : (
            <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Enter Password</h3>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your password..."
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-primary font-mono tracking-wider transition-colors placeholder-slate-400 dark:placeholder-slate-655"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-455 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !password.trim()}
                className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5"
              >
                {isAnalyzing ? 'Evaluating Security...' : 'Analyze Password'}
              </button>
            </div>
          )}

          {/* CHECKLIST (REVEAL ON ANALYZE) */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-5">
                  {/* STRENGTH PROGRESS BAR */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Complexity Score</span>
                      <span className={`${getStrengthStyles(metrics.strength).color} font-bold`}>
                        {metrics.strength} ({metrics.score}/100)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getStrengthStyles(metrics.strength).bar}`}
                        style={{ width: `${metrics.score}%` }}
                      />
                    </div>
                  </div>

                  {/* CHECKLIST */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Complexity Checklist
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { check: metrics.length, label: "Minimum 12 characters" },
                        { check: metrics.upper, label: "Uppercase letters (A-Z)" },
                        { check: metrics.lower, label: "Lowercase letters (a-z)" },
                        { check: metrics.number, label: "Numbers (0-9)" },
                        { check: metrics.special, label: "Special characters (!@#$)" },
                        { check: metrics.noRepeats, label: "No repeated patterns" },
                        { check: metrics.noCommonWords, label: "No common words" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          {item.check ? (
                            <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-4.5 w-4.5 text-slate-350 dark:text-slate-700 shrink-0" />
                          )}
                          <span className={item.check ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TIPS CARD */}
                <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-primary" /> Tips to Create Strong Passwords
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong className="text-slate-750 dark:text-slate-350">Use Passphrases:</strong> Combine three or four random words (e.g. <code className="px-1.5 py-0.5 rounded bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono">correcthorsebatterystaple</code>). They are hard for machines to guess but easy for you to visualize.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong className="text-slate-750 dark:text-slate-350">Avoid Personal Info:</strong> Do not include birth years, pet names, addresses, or usernames. Attacks scan your social profile to run targeted dictionary attacks.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong className="text-slate-750 dark:text-slate-350">Never Reuse:</strong> If a hacker steals your password from one minor site breach, they will immediately test it on your emails and bank logins.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DETAILS PANEL & SUGGESTIONS */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center"
              >
                <SkeletonLoader count={1} className="py-4" />
                <p className="text-xs text-center text-slate-455 dark:text-slate-500 mt-4">
                  Calculating cryptographic entropy...
                </p>
              </motion.div>
            )}

            {!isAnalyzing && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-dashed border-slate-200 dark:border-slate-800 text-center py-20 flex flex-col justify-center items-center"
              >
                <Key className="h-8 w-8 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="font-bold text-xs text-slate-750 dark:text-slate-350">Awaiting Evaluation</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1.5 max-w-[180px] mx-auto leading-relaxed">
                  Type a password and click the Analyze button to see strength metrics and suggested secure alternatives.
                </p>
              </motion.div>
            )}

            {!isAnalyzing && showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* METRICS */}
                <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Security Metrics</h3>
                  
                  <div className="p-4 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Estimated Crack Time</span>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{metrics.timeToCrack}</p>
                  </div>

                  <div className="p-4 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Security Level</span>
                    <div className="flex items-center gap-1.5">
                      {metrics.strength === 'Very Strong' || metrics.strength === 'Strong' ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                      )}
                      <span className={`font-black text-sm uppercase ${getStrengthStyles(metrics.strength).color}`}>
                        {metrics.strength}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SUGGESTION ENGINE */}
                {suggestions.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Strong Alternatives</h3>
                      </div>
                      <button
                        onClick={generateSuggestions}
                        className="p-1.5 border border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title="Generate More suggestions"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {suggestions.map((sug, idx) => (
                        <div key={idx} className="p-3 bg-slate-105 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-primary font-bold select-all break-all pr-2">
                              {sug.password}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-mono">
                                Very Strong
                              </span>
                              <button
                                onClick={() => handleCopy(sug.password)}
                                className="p-1.5 hover:bg-slate-205 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 rounded-lg transition-colors"
                                title="Copy to Clipboard"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-800/30 pt-1.5">
                            {sug.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
