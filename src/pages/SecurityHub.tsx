import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Globe, Key, QrCode, Award, FileText, 
  ShieldCheck, Sparkles, ShieldAlert, Activity, ArrowRight,
  Lock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { aiService } from '../services/ai/aiService';

interface ToolItem {
  name: string;
  path: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  actionText: string;
}

interface ToolGroup {
  category: string;
  description: string;
  tools: ToolItem[];
}

export const SecurityHub: React.FC = () => {
  const { scans, getSafetyScore } = useSecurity();
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (scans.length === 0) {
      setAiBrief(null);
      return;
    }

    const loadAdvisory = async () => {
      setIsBriefLoading(true);
      try {
        const brief = await aiService.getSecurityAdvisory(scans, getSafetyScore());
        setAiBrief(brief);
      } catch (err) {
        console.error("Failed to load security posture brief in Security Hub:", err);
      } finally {
        setIsBriefLoading(false);
      }
    };

    loadAdvisory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans]);

  const flaggedThreats = scans.filter(s => s.riskLevel === 'Danger' || s.riskLevel === 'Suspicious').length;

  const toolGroups: ToolGroup[] = [
    {
      category: "Web and Message Safety",
      description: "Analyze communications and web destinations for social engineering, phishing markers, and domain spoofs.",
      tools: [
        {
          name: "URL Safety Analyzer",
          path: "/url-analyzer",
          tag: "Domain & SSL Auditor",
          desc: "Inspect target URLs client-side for SSL validity, typosquatting variants, deceptive subdomains, and raw IP routing.",
          icon: <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          actionText: "Inspect URL"
        },
        {
          name: "Phishing Detector",
          path: "/phishing-detector",
          tag: "Heuristic NLP Classifier",
          desc: "Paste suspicious emails, SMS messages, or social posts to extract urgency patterns, coercion, and spoofed signatures.",
          icon: <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
          actionText: "Evaluate Message"
        }
      ]
    },
    {
      category: "Passwords and Identity",
      description: "Test credential resistance against brute-force attacks and create cryptographically random credentials locally.",
      tools: [
        {
          name: "Password Health Checker",
          path: "/password-checker",
          tag: "Zero-Transit Entropy",
          desc: "Measure password complexity entropy bits, common dictionary weakness, and estimated brute-force crack timings.",
          icon: <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          actionText: "Audit Credential"
        },
        {
          name: "Password Generator",
          path: "/password-generator",
          tag: "Cryptographic PRNG",
          desc: "Generate cryptographically secure random passwords and passphrases with custom character sets and length constraints.",
          icon: <Lock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
          actionText: "Generate Key"
        }
      ]
    },
    {
      category: "File and QR Inspection",
      description: "Audit unknown files and barcode matrix symbols before opening or executing on your workstation.",
      tools: [
        {
          name: "File Safety Analyzer",
          path: "/file-analyzer",
          tag: "Static Header Inspector",
          desc: "Verify uploaded files locally for double-extension deceptions, MIME type mismatches, and SHA-256 integrity checksums.",
          icon: <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          actionText: "Audit File"
        },
        {
          name: "QR Code Safety Checker",
          path: "/qr-scanner",
          tag: "Matrix Optical Scanner",
          desc: "Decode QR matrix images and camera inputs to evaluate destination landing security before mobile redirection.",
          icon: <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
          actionText: "Decode QR"
        }
      ]
    },
    {
      category: "Learning and Security Diagnostics",
      description: "Train personal security instincts and benchmark your organizational threat preparedness.",
      tools: [
        {
          name: "Cyber Hygiene Quiz",
          path: "/quiz",
          tag: "Interactive Assessment",
          desc: "Challenge your security instincts across real-world phishing and credential attack simulations to benchmark defensive habits.",
          icon: <Award className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
          actionText: "Begin Quiz"
        }
      ]
    }
  ];

  return (
    <div className="space-y-10 py-4 text-left max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>CyberShield Modular Toolbox</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Security Hub
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Select a specialized diagnostic scanner below. All calculations and analyses execute 100% locally in your client sandbox.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Activity className="h-4 w-4 text-primary" />
              <span>Session Report</span>
            </Link>
          </div>
        </div>

        {/* AUTHENTIC OPERATIONAL METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Diagnostic Modules
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">7 Ready</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Fully Operational
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Session Audits
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{scans.length}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {scans.length === 1 ? '1 scan recorded' : `${scans.length} scans recorded`}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Flagged Threats
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{flaggedThreats}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              {flaggedThreats > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Requires review
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Zero threats detected
                </span>
              )}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Execution Mode
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Client Sandbox</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Zero data logged
            </span>
          </div>
        </div>
      </div>

      {/* AI SECURITY POSTURE BRIEF */}
      {aiBrief && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">ShieldAI Security Posture Brief</h2>
            </div>

            {isBriefLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {aiBrief.summary}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {aiBrief.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {aiBrief.indicators && aiBrief.indicators.length > 0 && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> High Risk Signals
                      </span>
                      <div className="flex flex-col gap-1">
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
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Action Checklist
                      </span>
                      <div className="flex flex-col gap-1">
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
            )}
          </div>
        </div>
      )}

      {/* CATEGORIZED TOOLS GROUPS */}
      <div className="space-y-12">
        {toolGroups.map((group, groupIdx) => (
          <section key={groupIdx} className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{group.category}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({group.tools.length} {group.tools.length === 1 ? 'module' : 'modules'})
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {group.description}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${group.tools.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-5`}>
              {group.tools.map((tool, toolIdx) => (
                <Link
                  key={toolIdx}
                  to={tool.path}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:bg-primary/10 transition-colors">
                        {tool.icon}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
                        {tool.tag}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[44px]">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-dark">
                    <span>{tool.actionText}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SecurityHub;
