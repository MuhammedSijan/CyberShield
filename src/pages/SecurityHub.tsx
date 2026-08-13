import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Globe, Key, QrCode, Award, Play, FileText, 
  ShieldCheck, Zap, Lock, Shield, Sparkles, ShieldAlert, Activity
} from 'lucide-react';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useSecurity } from '../context/SecurityContext';
import { aiService } from '../services/ai/aiService';

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
  }, [scans]);

  const tools = [
    {
      name: "Phishing Detector",
      path: "/phishing-detector",
      desc: "Paste emails, SMS, or WhatsApp posts to extract structural threat elements and evaluate safety levels.",
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      color: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/5",
      graphic: (
        <svg className="w-full h-24 text-blue-500/20 dark:text-blue-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="90" height="40" rx="6" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <rect x="15" y="15" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
          <rect x="15" y="23" width="60" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
          <rect x="15" y="31" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="80" cy="25" r="10" stroke="currentColor" strokeWidth="1.2" />
          <path d="M77 25 L79 27 L83 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="80" cy="25" r="14" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
        </svg>
      )
    },
    {
      name: "URL Safety Analyzer",
      path: "/url-analyzer",
      desc: "Inspect target URLs for secure HTTPS signatures, DNS IP anchors, typosquatting, and subdomains.",
      icon: <Globe className="h-5 w-5 text-emerald-500" />,
      color: "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      graphic: (
        <svg className="w-full h-24 text-emerald-500/20 dark:text-emerald-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="25" r="18" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="50" cy="25" rx="18" ry="5.5" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="50" cy="25" rx="5.5" ry="18" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="7" x2="50" y2="43" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="32" y1="25" x2="68" y2="25" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          <circle cx="62" cy="16" r="2.5" fill="currentColor" opacity="0.75" />
          <circle cx="38" cy="34" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      )
    },
    {
      name: "Password Health Checker",
      path: "/password-checker",
      desc: "Evaluate complexity entropy and compute crack-time predictions locally in your browser.",
      icon: <Key className="h-5 w-5 text-amber-500" />,
      color: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/5",
      graphic: (
        <svg className="w-full h-24 text-amber-500/20 dark:text-amber-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="25" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="5 3" />
          <circle cx="50" cy="25" r="12" stroke="currentColor" strokeWidth="0.8" />
          <path d="M44 25 H56 M52 25 L52 28.5 M55 25 L55 28.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="41" cy="25" r="3" stroke="currentColor" strokeWidth="1.2" />
          <line x1="50" y1="2" x2="50" y2="6" stroke="currentColor" strokeWidth="1.2" />
          <line x1="50" y1="44" x2="50" y2="48" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    },
    {
      name: "Password Generator",
      path: "/password-generator",
      desc: "Generate cryptographically secure random passwords of custom sizes and character sets locally.",
      icon: <Key className="h-5 w-5 text-cyan-500" />,
      color: "border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-cyan-500/5",
      graphic: (
        <svg className="w-full h-24 text-cyan-500/20 dark:text-cyan-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="28" y="12" width="44" height="26" rx="4" stroke="currentColor" strokeWidth="1" />
          <line x1="39" y1="12" x2="39" y2="38" stroke="currentColor" strokeWidth="0.8" />
          <line x1="50" y1="12" x2="50" y2="38" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="61" y1="12" x2="61" y2="38" stroke="currentColor" strokeWidth="0.8" />
          <path d="M42 12 V9 C42 6, 58 6, 58 9 V12" stroke="currentColor" strokeWidth="1" />
          <circle cx="33" cy="20" r="1.2" fill="currentColor" />
          <circle cx="33" cy="30" r="1.2" fill="currentColor" opacity="0.4" />
          <circle cx="67" cy="25" r="1.2" fill="currentColor" />
        </svg>
      )
    },
    {
      name: "File Safety Analyzer",
      path: "/file-analyzer",
      desc: "Upload files locally to inspect double extension indicators, MIME patterns, sizes, and SHA-256 hashes.",
      icon: <FileText className="h-5 w-5 text-violet-500" />,
      color: "border-violet-500/20 hover:border-violet-500/50 hover:shadow-violet-500/5",
      graphic: (
        <svg className="w-full h-24 text-violet-500/20 dark:text-violet-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M38 6 H54 L62 14 V44 H38 Z" stroke="currentColor" strokeWidth="1" />
          <path d="M54 6 V14 H62" stroke="currentColor" strokeWidth="1" />
          <line x1="43" y1="24" x2="57" y2="24" stroke="currentColor" strokeWidth="1.2" />
          <line x1="43" y1="30" x2="53" y2="30" stroke="currentColor" strokeWidth="1.2" />
          <line x1="43" y1="36" x2="55" y2="36" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="50" cy="11" r="2" fill="currentColor" opacity="0.35" />
        </svg>
      )
    },
    {
      name: "QR Code Safety Checker",
      path: "/qr-scanner",
      desc: "Decode QR matrix graphics to check redirectional landing destination safety.",
      icon: <QrCode className="h-5 w-5 text-indigo-500" />,
      color: "border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/5",
      graphic: (
        <svg className="w-full h-24 text-indigo-500/20 dark:text-indigo-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="28" y="10" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
          <rect x="31" y="13" width="4" height="4" fill="currentColor" />
          <rect x="62" y="10" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
          <rect x="65" y="13" width="4" height="4" fill="currentColor" />
          <rect x="28" y="30" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
          <rect x="31" y="33" width="4" height="4" fill="currentColor" />
          <path d="M22 14 V6 H30" stroke="currentColor" strokeWidth="1" />
          <path d="M78 14 V6 H70" stroke="currentColor" strokeWidth="1" />
          <path d="M22 36 V44 H30" stroke="currentColor" strokeWidth="1" />
          <path d="M78 36 V44 H70" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="0.8" className="animate-pulse" />
        </svg>
      )
    },
    {
      name: "Cyber Hygiene Quiz",
      path: "/quiz",
      desc: "Challenge your security habits with real-world scenarios to unlock threat sentinel ranking badges.",
      icon: <Award className="h-5 w-5 text-rose-500" />,
      color: "border-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/5",
      graphic: (
        <svg className="w-full h-24 text-rose-500/20 dark:text-rose-500/10 pointer-events-none select-none my-3" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 6 L70 14 V30 C70 38, 50 44, 50 44 C50 44, 30 38, 30 30 V14 Z" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="22" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M47.5 22 L49.5 24 L52.5 19.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="50" cy="35" r="1.5" fill="currentColor" />
        </svg>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const totalReportsGenerated = scans.length;

  return (
    <div className="space-y-10 py-4 text-left max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto border border-primary/20">
          <Shield className="h-8 w-8 text-primary animate-pulse-glow" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Security Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Run browser-based cybersecurity diagnostics with complete privacy. Select an option below to analyze exposure paths.
        </p>
      </div>

      {/* STATS COUNT GRID SECTION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[
          {
            label: "Security Modules",
            target: 7,
            suffix: "",
            icon: <Shield className="h-4 w-4 text-blue-500" />
          },
          {
            label: "Browser Protected",
            target: 100,
            suffix: "%",
            icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />
          },
          {
            label: "Reports Generated",
            target: totalReportsGenerated,
            suffix: "",
            icon: <FileText className="h-4 w-4 text-purple-500" />
          },
          {
            label: "Local Processing",
            target: 100,
            suffix: "%",
            icon: <Zap className="h-4 w-4 text-amber-500" />
          },
          {
            label: "Privacy Protected",
            target: 100,
            suffix: "%",
            icon: <Lock className="h-4 w-4 text-indigo-500" />
          }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-[#0c1322]/20 flex flex-col justify-between min-h-[90px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-455 dark:text-slate-500">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-xl font-black text-slate-850 dark:text-white mt-2">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
            </p>
          </div>
        ))}
      </div>

      {/* AI SECURITY POSTURE BRIEF */}
      {aiBrief && (
        <div className="glass-panel p-6 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-primary">ShieldAI Posture Analysis</h2>
            </div>

            {isBriefLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-805 dark:text-white leading-relaxed">
                    {aiBrief.summary}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {aiBrief.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {aiBrief.indicators && aiBrief.indicators.length > 0 && (
                    <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-505 dark:text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-505" /> Weakness Areas
                      </span>
                      <div className="flex flex-col gap-1">
                        {aiBrief.indicators.map((ind: string, idx: number) => (
                          <div key={idx} className="text-xs text-slate-550 dark:text-slate-405 flex items-start gap-1">
                            <span className="text-rose-550">•</span>
                            <span>{ind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiBrief.recommendations && aiBrief.recommendations.length > 0 && (
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-emerald-500" /> Action Checklist
                      </span>
                      <div className="flex flex-col gap-1">
                        {aiBrief.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="text-xs text-slate-550 dark:text-slate-405 flex items-start gap-1">
                            <span className="text-emerald-500">✓</span>
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

      {/* TOOLS GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2"
      >
        {tools.map((tool, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ 
              y: -8,
              scale: 1.015,
              boxShadow: '0 20px 40px -15px rgba(37,99,235,0.15)'
            }}
            className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${tool.color}`}
          >
            {/* Ambient Shimmer Sweep hover overlay */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-850 rounded-xl group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 border border-transparent dark:border-slate-800/50">
                  {tool.icon}
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base group-hover:text-primary transition-colors duration-200">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[50px]">
                  {tool.desc}
                </p>
              </div>

              {/* Cybersecurity abstract SVG illustration */}
              <div className="opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                {tool.graphic}
              </div>
            </div>

            <Link
              to={tool.path}
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary hover:bg-primary-dark group-hover:translate-y-[-1px] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/10"
            >
              Start Check <Play className="h-3 w-3 fill-current" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
export default SecurityHub;
