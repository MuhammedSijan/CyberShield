import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Terminal, ChevronDown, ChevronUp,
  MessageSquare, Globe, Key, QrCode, Award, Zap, HelpCircle 
} from 'lucide-react';

export const Home: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const tools = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Phishing Detector",
      desc: "Analyze suspicious emails, WhatsApp chats, or SMS messages to spot fraud before clicking.",
      path: "/phishing-detector"
    },
    {
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
      title: "URL Safety Analyzer",
      desc: "Paste any link to inspect typosquatting, HTTP status, suspicious parameters, and safety levels.",
      path: "/url-analyzer"
    },
    {
      icon: <Key className="h-6 w-6 text-amber-500" />,
      title: "Password Strength Checker",
      desc: "Evaluate passwords client-side with instant suggested variations and time-to-crack estimation.",
      path: "/password-checker"
    },
    {
      icon: <QrCode className="h-6 w-6 text-indigo-500" />,
      title: "QR Code Safety Checker",
      desc: "Decode local QR code images and verify target destination redirects securely.",
      path: "/qr-scanner"
    },
    {
      icon: <Award className="h-6 w-6 text-rose-500" />,
      title: "Cyber Hygiene Quiz",
      desc: "Interactive multiple-choice scenarios to test your online security IQ and get cyber badges.",
      path: "/quiz"
    }
  ];

  const benefits = [
    {
      title: "SaaS Quality UI",
      desc: "Clean, responsive, glassmorphic layout optimized for both desktop and mobile devices."
    },
    {
      title: "100% Privacy Focused",
      desc: "Sensitive calculations (like passwords) are calculated entirely locally in your browser."
    },
    {
      title: "Immediate Diagnostics",
      desc: "Get instant diagnostic alerts and safety metrics for scanned elements."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Choose a Diagnostic Tool",
      desc: "Pick Phishing, URL, Password, QR, or Quiz depending on your current concern."
    },
    {
      num: "02",
      title: "Analyze Suspicious Input",
      desc: "Paste texts, input links, or drop images. Let our client-side models evaluate threat markers."
    },
    {
      num: "03",
      title: "Get Recommendations",
      desc: "Read detailed indicator summaries and follow structured action plans to protect your data."
    }
  ];

  const faqs = [
    {
      q: "Is it safe to type my passwords here?",
      a: "Yes, absolutely. The Password Health Checker runs entirely inside your web browser (client-side) using secure cryptography and entropy models. Your password entries are never stored, transmitted, or sent to any server."
    },
    {
      q: "How does the Phishing Detector analyze messages?",
      a: "It scans the textual content of emails, SMS, or WhatsApp posts for urgent social engineering language, mismatching sender signatures, and fraudulent hyperlinks, then highlights risky triggers."
    },
    {
      q: "Can I connect this application to a real backend?",
      a: "Yes. CyberShield is structured with clean modular files. You can replace the mock service implementations with API requests to LLMs or threat intelligence APIs (e.g., VirusTotal or Safe Browsing) without rewriting any UI component."
    },
    {
      q: "What is the Cyber Safety Score?",
      a: "The safety score on the dashboard is an overall grade representing your security status, aggregated from your performance on the Cyber Hygiene Quiz and diagnostic tools."
    }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* HERO SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center relative max-w-4xl mx-auto space-y-6 pt-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wide">
          <Zap className="h-3 w-3" /> Professional Cybersecurity Suite
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-800 dark:text-white">
          Detect Cyber Threats <br className="hidden sm:inline" />
          Before They <span className="text-primary text-glow">Happen</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CyberShield helps everyday internet users identify phishing scams, analyze suspicious links, secure passwords, and test their security hygiene in real time.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            to="/hub"
            className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-xl shadow-primary/25 transition-all text-sm"
          >
            Start Security Check
          </Link>
          <Link
            to="/quiz"
            className="px-8 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all text-sm"
          >
            Take Security Quiz
          </Link>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            Integrated Security Modules
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Access direct client-side diagnostic evaluations covering common internet vulnerability vectors.
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {tools.map((tool, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{tool.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tool.desc}</p>
              </div>
              <Link
                to={tool.path}
                className="mt-6 text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1 group w-fit"
              >
                Launch Tool 
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            How It Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Three simple steps to secure your daily digital workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative glass-panel p-8 rounded-2xl space-y-3">
              <span className="text-5xl font-black text-primary/10 absolute top-4 right-4">{step.num}</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS / WHY CYBERSHIELD */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Why Choose CyberShield?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Many security applications are built with complex terminology and interfaces designed only for tech-savvy specialists. CyberShield breaks down technical threat metadata into actionable alerts and easy checklists.
          </p>
          <div className="space-y-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded mt-0.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{benefit.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center h-80 bg-gradient-to-br from-primary/5 to-slate-900/5">
          <Terminal className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Simulate Threat Vectors</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Practice identifying phishing schemes and testing real password entropy entirely in a secure environment. Prepare for real-world scenarios before they arrive.
          </p>
          <div className="flex gap-2">
            <span className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">#NoTracker</span>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">#SaaS-Ready</span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <HelpCircle className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/20"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 pt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/30 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
