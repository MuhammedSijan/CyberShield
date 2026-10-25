import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, MessageSquare, 
  Globe, Key, FileCheck, QrCode, Award,
  CheckCircle2, Lock, Cpu, Server, ChevronRight, Search
} from 'lucide-react';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const Home: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleHeroUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      navigate('/url-analyzer');
      return;
    }
    navigate(`/url-analyzer?url=${encodeURIComponent(urlInput.trim())}`);
  };

  const sampleUrls = [
    'paypal-security-update.com',
    'auth.secure-banking.net',
    'accounts.google.com'
  ];

  const coreTools = [
    {
      title: "URL Safety Analyzer",
      category: "Web Security",
      path: "/url-analyzer",
      desc: "Inspect suspicious domains, typosquatting variants, SSL validity, and redirection chains.",
      icon: <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    },
    {
      title: "Phishing Detector",
      category: "Message Safety",
      path: "/phishing-detector",
      desc: "Analyze emails, SMS, and messaging texts for urgent coercion, manipulation, and spoofed links.",
      icon: <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: "Password Health",
      category: "Identity Protection",
      path: "/password-checker",
      desc: "Calculate entropy bits, dictionary vulnerability, and brute-force crack timings locally.",
      icon: <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    },
    {
      title: "File Safety Analyzer",
      category: "File Inspection",
      path: "/file-analyzer",
      desc: "Audit uploads for hidden executable extensions, MIME mismatches, and SHA-256 signatures.",
      icon: <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    },
    {
      title: "QR Safety Scanner",
      category: "Physical Vector",
      path: "/qr-scanner",
      desc: "Decode barcode matrices and evaluate destination redirects before visiting on mobile.",
      icon: <QrCode className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
    },
    {
      title: "Hygiene Quiz",
      category: "Training & Education",
      path: "/quiz",
      desc: "Evaluate your practical security instincts through realistic, modern cyber threat scenarios.",
      icon: <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
    }
  ];

  return (
    <div className="space-y-20 py-4 text-left">
      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 pb-8 border-b border-slate-200 dark:border-slate-800/80">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Zero-Trust Client-Side Security Sandbox</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Inspect threats <br className="hidden sm:inline" />
            <span className="text-primary">before you trust.</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            CyberShield runs comprehensive diagnostic audits entirely within your browser. Inspect suspect URLs, verify incoming messages, evaluate credentials, and audit downloads without exposing data.
          </p>

          {/* Functional URL Inspection Input Bar */}
          <div className="pt-2 max-w-xl">
            <form onSubmit={handleHeroUrlSubmit} className="space-y-3">
              <label htmlFor="hero-url-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quick Link Inspection
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    id="hero-url-input"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste a website link to analyze (e.g., https://...)"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  Analyze URL
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sample Quick Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Test sample:</span>
                {sampleUrls.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setUrlInput(sample);
                      navigate(`/url-analyzer?url=${encodeURIComponent(sample)}`);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700/80"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              100% Client-Side Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Zero Network Interception
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Instant Heuristics
            </span>
          </div>
        </div>

        {/* Right Column: Authoritative Security Sandbox Architecture Card */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Local Inspection Engine</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">v2.4.0-stable</span>
            </div>

            {/* Architecture Diagnostic Layers */}
            <div className="space-y-3">
              {[
                {
                  label: "URL Pattern & SSL Heuristics",
                  status: "Active",
                  sub: "Typosquatting, IP redirects, TLD risk analysis",
                  icon: <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                },
                {
                  label: "NLP Social Engineering Classifier",
                  status: "Active",
                  sub: "Panic patterns, credential urgency scoring",
                  icon: <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                },
                {
                  label: "Local Entropy & Crack Engine",
                  status: "Active",
                  sub: "Zero-transit hash math, character space calculation",
                  icon: <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                },
                {
                  label: "MIME & Binary File Inspector",
                  status: "Active",
                  sub: "Double extensions, payload signature analysis",
                  icon: <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                }
              ].map((layer, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 mt-0.5">
                    {layer.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {layer.label}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        {layer.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {layer.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Cpu className="h-3.5 w-3.5 text-slate-400" /> Client Sandbox
              </span>
              <Link to="/hub" className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                Explore all modules <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE TOOLS DIRECTORY */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Diagnostic Tools</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Select a Security Module
            </h2>
          </div>
          <Link
            to="/hub"
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 self-start sm:self-auto"
          >
            Open full Security Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreTools.map((tool, idx) => (
            <Link
              key={idx}
              to={tool.path}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 group-hover:bg-primary/10 transition-colors">
                    {tool.icon}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {tool.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-dark">
                <span>Launch tool</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. WHY CHOOSE CYBERSHIELD */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Zero-Trust Standard</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security Designed Around Data Privacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike cloud-inspection services that harvest your queried URLs, passwords, and message drafts, CyberShield was engineered from day one to execute analytics locally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {[
            {
              icon: <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              title: "Zero Transit of Passwords",
              desc: "Passwords and credentials are evaluated against mathematical entropy models locally. Raw characters never leave your device."
            },
            {
              icon: <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
              title: "Client Heuristic Engines",
              desc: "Pattern algorithms flag typo variants, unencrypted ports, and deceptive subdomains without logging queries."
            },
            {
              icon: <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
              title: "Exportable Audit Reports",
              desc: "Consolidate active scan sessions into clean, professional PDF compliance reports for auditing or personal record-keeping."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Three Steps to Full Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Rapid client-side threat assessment without software installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Select Inspection Vector",
              desc: "Choose between web URLs, phishing messages, passwords, QR codes, or uploaded files depending on your verification goal."
            },
            {
              step: "02",
              title: "Run Local Analysis",
              desc: "Input your text, link, or document. The engine analyzes protocol headers, character entropy, and threat signatures locally."
            },
            {
              step: "03",
              title: "Review Risk Advisory",
              desc: "Receive clear, color-coded risk determinations, root-cause explanations, and suggested security actions."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md inline-block">
                {item.step}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VERIFIED STATS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {
              target: 7,
              suffix: "",
              label: "Security Modules Ready"
            },
            {
              target: 100,
              suffix: "%",
              label: "Client-Side Processing"
            },
            {
              target: 35000,
              suffix: "+",
              isLargeNumber: true,
              label: "Audits Completed"
            },
            {
              target: 0,
              suffix: "ms",
              label: "Data Logged to Cloud"
            }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedCounter 
                  target={stat.target} 
                  suffix={stat.suffix} 
                  isLargeNumber={stat.isLargeNumber} 
                />
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Start Securing Your Workflows Today
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Inspect unknown links, audit password integrity, and detect phishing attempts in seconds with CyberShield.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/hub"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            Open Security Hub <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700 font-semibold text-xs sm:text-sm rounded-xl transition-all"
          >
            View Active Reports
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
