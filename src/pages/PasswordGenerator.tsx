import React, { useState, useEffect } from 'react';
import {
  Key, Copy, RefreshCw, Lock, Sliders
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    showToast('Regenerated', `Password #${idx + 1} regenerated.`, 'success');
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Copied to Clipboard', 'Secure password copied to clipboard.', 'success');
  };

  const getStrengthBadge = (strength: GeneratedPassword['strength']) => {
    switch (strength) {
      case 'Very Strong':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'Strong':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'Medium':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      default:
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
          <Key className="h-3.5 w-3.5" />
          <span>Cryptographic PRNG Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Password Generator
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Create cryptographically secure random passwords and phrases using browser entropy APIs. Passwords are never sent across networks.
        </p>
      </div>

      {/* PRIVACY NOTICE */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">PRNG Generation Guarantee:</strong> Characters are sampled locally using Web Cryptography <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">crypto.getRandomValues</code>. No external API or telemetry is involved.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CONFIGURATION (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="h-4 w-4 text-primary" /> Generator Parameters
            </h2>

            {/* Length slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Password Length</span>
                <span className="text-primary font-bold">{length} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>8</span>
                <span>24</span>
                <span>40</span>
                <span>64</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Symbols (!@#$%^&*)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Exclude Ambiguous Characters (l, 1, I, O, 0)</span>
              </label>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate All Passwords</span>
            </button>
          </div>
        </div>

        {/* GENERATED PASSWORDS LIST (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Generated Passwords ({passwords.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click copy to use
            </span>
          </div>

          <div className="space-y-3">
            {passwords.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">#{idx + 1}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStrengthBadge(item.strength)}`}>
                      {item.strength} ({item.score}%)
                    </span>
                  </div>
                  <p className="font-mono text-sm text-slate-900 dark:text-slate-100 font-bold select-all break-all">
                    {item.value}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRegenerateIndex(idx)}
                    title="Regenerate this password"
                    aria-label={`Regenerate password #${idx + 1}`}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.value)}
                    aria-label={`Copy password #${idx + 1} to clipboard`}
                    className="px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
