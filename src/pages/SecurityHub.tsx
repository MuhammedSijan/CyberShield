import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Globe, Key, QrCode, Award, ShieldAlert, Play, FileText 
} from 'lucide-react';

export const SecurityHub: React.FC = () => {
  const tools = [
    {
      name: "Phishing Detector",
      path: "/phishing-detector",
      desc: "Paste emails, SMS, or WhatsApp posts to extract structural threat elements and evaluate safety levels.",
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      color: "border-blue-500/20 hover:border-blue-500/50"
    },
    {
      name: "URL Safety Analyzer",
      path: "/url-analyzer",
      desc: "Inspect target URLs for secure HTTPS signatures, DNS IP anchors, typosquatting, and subdomains.",
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
      color: "border-emerald-500/20 hover:border-emerald-500/50"
    },
    {
      name: "Password Health Checker",
      path: "/password-checker",
      desc: "Evaluate complexity entropy and compute crack-time predictions locally in your browser.",
      icon: <Key className="h-6 w-6 text-amber-500" />,
      color: "border-amber-500/20 hover:border-amber-500/50"
    },
    {
      name: "Password Generator",
      path: "/password-generator",
      desc: "Generate cryptographically secure random passwords of custom sizes and character sets locally.",
      icon: <Key className="h-6 w-6 text-cyan-500" />,
      color: "border-cyan-500/20 hover:border-cyan-500/50"
    },
    {
      name: "File Safety Analyzer",
      path: "/file-analyzer",
      desc: "Upload files locally to inspect double extension indicators, MIME patterns, sizes, and SHA-256 hashes.",
      icon: <FileText className="h-6 w-6 text-violet-500" />,
      color: "border-violet-500/20 hover:border-violet-500/50"
    },
    {
      name: "QR Code Safety Checker",
      path: "/qr-scanner",
      desc: "Decode QR matrix graphics to check redirectional landing destination safety.",
      icon: <QrCode className="h-6 w-6 text-indigo-500" />,
      color: "border-indigo-500/20 hover:border-indigo-500/50"
    },
    {
      name: "Cyber Hygiene Quiz",
      path: "/quiz",
      desc: "Challenge your security habits with real-world scenarios to unlock threat sentinel ranking badges.",
      icon: <Award className="h-6 w-6 text-rose-500" />,
      color: "border-rose-500/20 hover:border-rose-500/50"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-8 py-6">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Security Check Hub
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
          Select one of our specialized client-side scanners below to evaluate active digital threats and inspect your personal exposure vectors.
        </p>
      </div>

      {/* TOOLS GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
      >
        {tools.map((tool, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between transition-all ${tool.color}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {tool.icon}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{tool.name}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">{tool.desc}</p>
              </div>
            </div>

            <Link
              to={tool.path}
              className="mt-6 flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/10"
            >
              Start Check <Play className="h-3 w-3 fill-current" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
