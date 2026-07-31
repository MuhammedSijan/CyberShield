import React from 'react';
import { Shield, Lock, Eye, Code, Terminal } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Privacy First",
      desc: "We analyze high-risk configurations like passwords entirely in your browser window to guarantee zero network intercepts."
    },
    {
      icon: <Eye className="h-6 w-6 text-emerald-500" />,
      title: "User Accessibility",
      desc: "Security should be simple. We translate complex threat metadata and domain headers into actionable alert points."
    },
    {
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      title: "Clean Open Architecture",
      desc: "Built with standard TypeScript, React, and modular components, allowing developers to plug in backend API models easily."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* HERO HERO */}
      <div className="text-center space-y-4">
        <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          About CyberShield
        </h1>
        <p className="text-slate-550 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          CyberShield is a personal cybersecurity assistant built to educate and protect everyday internet users from the growing complexity of online threats.
        </p>
      </div>

      {/* CORE VISION */}
      <section className="glass-panel p-8 rounded-3xl border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Our Mission</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Every day, thousands of people fall victim to phishing emails, fraudulent SMS campaigns, and credential harvesting because traditional security tools are either too complex or hidden behind corporate paywalls.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            CyberShield bridges this gap by creating an intuitive, premium, client-side diagnostics playground where anyone can copy-paste emails, links, or passwords to immediately check their safety markings before taking online action.
          </p>
        </div>
        <div className="p-6 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" /> Dev-Ready Framework
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This workspace represents a modern React SPA designed with robust TypeScript structures. The services layer can be connected to intelligence database feeds (like Google Safe Browsing, VirusTotal, or OpenAI GPT-4 APIs) in less than an hour.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">Vite</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">React Router</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center">Core Design Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
              <div className="p-3 bg-slate-105 dark:bg-slate-800 rounded-xl w-fit">
                {v.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">{v.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
