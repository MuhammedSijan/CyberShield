import React, { useState, useEffect } from 'react';
import { 
  Key, Copy, RefreshCw, Settings, Info
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';

interface GeneratedPassword {
  value: string;
  strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  score: number;
}

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const evaluateStrength = (pwd: string): { strength: GeneratedPassword['strength']; score: number } => {
    let score = 0;
    const len = pwd.length;
    
    // Length contribution
    score += Math.min(len * 3, 40);

    // Character set contributions
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    let strength: GeneratedPassword['strength'] = 'Weak';
    if (score >= 85) {
      strength = 'Very Strong';
    } else if (score >= 65) {
      strength = 'Strong';
    } else if (score >= 40) {
      strength = 'Medium';
    }

    return { strength, score };
  };

  const generateSinglePassword = (): string => {
    let charset = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let nums = '0123456789';
    let syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      const similar = /[il1Lo0O8B]/g;
      upper = upper.replace(similar, '');
      lower = lower.replace(similar, '');
      nums = nums.replace(similar, '');
      syms = syms.replace(similar, '');
    }

    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += nums;
    if (includeSymbols) charset += syms;

    if (!charset) {
      return '';
    }

    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    return result;
  };

  const handleGenerate = (silent = false) => {
    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
      showToast('Validation Error', 'Please select at least one character set.', 'warning');
      return;
    }

    const list: GeneratedPassword[] = [];
    for (let i = 0; i < 5; i++) {
      const val = generateSinglePassword();
      const evalInfo = evaluateStrength(val);
      list.push({
        value: val,
        ...evalInfo
      });
    }

    setPasswords(list);
    
    // Add check item to global security reports
    if (!silent) {
      const avgScore = Math.round(list.reduce((acc, curr) => acc + curr.score, 0) / list.length);
      const minStrength = list.some(p => p.strength === 'Weak') 
        ? 'Danger' 
        : list.some(p => p.strength === 'Medium') 
        ? 'Suspicious' 
        : 'Safe';

      addScan(
        'generator',
        `Generated 5x passwords (${length} chars)`,
        `Average Score: ${avgScore}/100`,
        100 - avgScore,
        minStrength
      );
      showToast('Passwords Generated', '5 secure passwords created client-side.', 'success');
    }
  };

  useEffect(() => {
    handleGenerate(true);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar]);

  const handleRegenerateIndex = (idx: number) => {
    const newVal = generateSinglePassword();
    const evalInfo = evaluateStrength(newVal);
    const updated = [...passwords];
    updated[idx] = {
      value: newVal,
      ...evalInfo
    };
    setPasswords(updated);
    showToast('Regenerated', `Password #${idx + 1} regenerated successfully.`, 'success');
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Copied to Clipboard', 'Secure password copied successfully.', 'success');
  };

  const getStrengthColor = (strength: GeneratedPassword['strength']) => {
    switch (strength) {
      case 'Very Strong':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Strong':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Password Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate cryptographically secure random passwords entirely inside your browser. Customizable length and rules.
        </p>
      </div>

      {/* PRIVACY NOTICE */}
      <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10 dark:bg-blue-500/5 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-800 dark:text-white">🔒 Security Policy:</span> Passwords are generated locally using the cryptographic `crypto.getRandomValues` Web API and are never transmitted to any server.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONFIGURATION COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800/40 pb-3">
              <Settings className="h-4 w-4 text-primary" /> Configuration
            </h3>

            {/* Length slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Password Length</span>
                <span className="text-primary font-bold">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Include Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Include Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Include Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Include Symbols (!@#$)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs border-t border-slate-200 dark:border-slate-800/40 pt-4">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Exclude Similar (i, l, 1, 0, O)</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleGenerate(false)}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate All
              </button>
            </div>
          </div>
        </div>

        {/* BATCH PASSWORDS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-205 dark:border-slate-800/40 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-primary" /> Generated Passwords
              </h3>
            </div>

            <div className="space-y-3.5">
              {passwords.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-slate-105 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:border-slate-300 dark:hover:border-slate-750 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="font-mono text-sm text-primary font-bold select-all break-all pr-2">
                      {item.value || <span className="text-slate-400 font-sans text-xs">Awaiting parameters...</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStrengthColor(item.strength)}`}>
                        {item.strength}
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500">
                        Score: {item.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(item.value)}
                      disabled={!item.value}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                      title="Copy to Clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRegenerateIndex(idx)}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 rounded-lg transition-colors"
                      title="Regenerate Password"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
