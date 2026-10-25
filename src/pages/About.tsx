import { Shield, Lock, Eye, Code, Terminal } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Privacy First",
      desc: "We analyze high-risk inputs like passwords entirely in your browser window to guarantee zero network intercepts."
    },
    {
      icon: <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Immediate Actionability",
      desc: "Security should be understandable. We translate complex threat metadata and domain headers into actionable guidance."
    },
    {
      icon: <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Modular Architecture",
      desc: "Built with standard TypeScript, React, and modular components, allowing developers to plug in backend threat feeds easily."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 text-left">
      {/* HERO */}
      <div className="text-center space-y-3">
        <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto text-primary border border-primary/20">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About CyberShield
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          CyberShield is a browser-sandboxed security suite engineered to diagnose phishing, inspect malicious URLs, and verify credential health without harvesting data.
        </p>
      </div>

      {/* CORE VISION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Purpose & Vision</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Our Mission
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every day, users fall victim to phishing attacks, fraudulent SMS campaigns, and credential harvesting because security scanners are either too complex or hidden behind corporate subscriptions.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            CyberShield creates an intuitive, client-side diagnostics toolbox where anyone can inspect hyperlinks, files, or credentials locally before taking online action.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" /> Engineering Standards
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Built as a zero-trust React SPA with modern TypeScript. All diagnostics, entropy checks, and hash calculations run directly in the client runtime without external tracking dependencies.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/60">TypeScript</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Web Cryptography</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Client Sandbox</span>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Design & Architecture Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                {v.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{v.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
