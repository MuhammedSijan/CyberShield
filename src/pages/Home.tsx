import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowRight, MessageSquare, 
  Globe, Key, FileCheck, Play 
} from 'lucide-react';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';

export const Home: React.FC = () => {
  const { user, guestMode } = useAuth();
  const { scans, getSafetyScore } = useSecurity();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  // Mouse tilt states for shield
  const [coords, setCoords] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  const shieldContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = shieldContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 14;
    const tiltY = (x / (rect.width / 2)) * 14;
    const glowX = e.clientX - rect.left;
    const glowY = e.clientY - rect.top;
    setCoords({ x: glowX, y: glowY, tiltX, tiltY });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const nameVal = guestMode ? 'Guest' : user?.firstName || 'User';

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Viewport scroll reveal settings
  const scrollReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    }
  };

  const previewFeatures = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Phishing Detection",
      desc: "Instantly evaluate sms, email, and social messages for social engineering signatures and manipulation panic patterns."
    },
    {
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
      title: "URL Safety",
      desc: "Analyze website hyperlinks client-side for SSL validity checks, typosquatting domain patterns, and brand spoofing."
    },
    {
      icon: <Key className="h-6 w-6 text-amber-500" />,
      title: "Password Security",
      desc: "Verify credential complexity scales and compute brute-force timings locally without uploading password contents."
    },
    {
      icon: <FileCheck className="h-6 w-6 text-indigo-500" />,
      title: "File Protection",
      desc: "Audit document, zip, or executable downloads locally, checking MIME types, double extensions, and size parameters."
    }
  ];

  // Scroll restoration
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-16 py-4 relative">

      {/* Styles for isolated rotating and dash animations */}
      <style>{`
        @keyframes shieldDash {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.7; }
        }
      `}</style>

      {/* DYNAMIC WELCOME USER GREETING BANNER */}
      <div className="glass-panel p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-[#0d1424]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white">
            {getGreeting()}, {nameVal} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {scans.length > 0 
              ? `You have executed ${scans.length} browser-sandboxed threat checks in this session.` 
              : 'Execute client-side threat analytics to inspect exposure indexes.'}
          </p>
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Quick Stats: Score dial */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin-slow flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-350 bg-slate-50/10">
              {getSafetyScore()}%
            </div>
            <div>
              <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-550">Security Index</p>
              <p className="text-xs font-bold text-slate-805 dark:text-slate-200">{getSafetyScore() >= 80 ? 'Optimal' : 'Action Required'}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-205 dark:bg-slate-800 hidden sm:block" />

          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold">Quick Links:</span>
            <Link to="/hub" className="px-2.5 py-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold rounded-lg transition-all">
              Hub
            </Link>
            <Link to="/password-checker" className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all">
              Passwords
            </Link>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={scrollReveal}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Client-Side Threat Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-[1.1]">
            Protect Before <br />
            You Click.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            CyberShield is an enterprise-grade cybersecurity sandbox running 100% locally in your web browser. Inspect links, verify files, check credentials, and stop cyber threats before they take root.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/hub"
              className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center gap-2"
            >
              Start Security Check <Play className="h-4 w-4 fill-current" />
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Floating Neon SVG Shield Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          {/* Backlit blur glow */}
          <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0" />
          
          <div 
            ref={shieldContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${coords.tiltX}deg) rotateY(${coords.tiltY}deg) scale3d(1.01, 1.01, 1.01)`,
              transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
              transformStyle: 'preserve-3d'
            }}
            className="relative z-10 cursor-pointer p-4"
          >
            <svg 
              className="w-64 h-64 sm:w-80 sm:h-80 drop-shadow-[0_0_35px_rgba(37,99,235,0.4)]" 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                {/* Dynamic spot cursor glow gradient */}
                <radialGradient id="cursorGlow" cx={`${(coords.x / 320) * 100}%`} cy={`${(coords.y / 320) * 100}%`} r="30%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Rotating outer dash security ring 1 */}
              <circle 
                cx="100" 
                cy="100" 
                r="92" 
                stroke="#2563eb" 
                strokeWidth="1.2" 
                strokeDasharray="16 28" 
                opacity="0.3"
                style={{
                  transformOrigin: 'center',
                  animation: 'ringRotate 22s linear infinite'
                }}
              />

              {/* Rotating inner dash security ring 2 */}
              <circle 
                cx="100" 
                cy="100" 
                r="84" 
                stroke="#60a5fa" 
                strokeWidth="0.8" 
                strokeDasharray="6 12" 
                opacity="0.4"
                style={{
                  transformOrigin: 'center',
                  animation: 'ringRotate 14s linear infinite reverse'
                }}
              />

              {/* Outer Glow Shield Frame (With scrolling dash animation) */}
              <path 
                d="M100 20 C140 20, 170 35, 170 35 C170 35, 170 115, 100 175 C30 115, 30 35, 30 35 C30 35, 60 20, 100 20 Z" 
                stroke="url(#glowGrad)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeDasharray="600"
                style={{
                  animation: 'shieldDash 10s linear infinite'
                }}
              />

              {/* Inner Premium Glass Translucent Fill */}
              <path 
                d="M100 27 C136 27, 163 41, 163 41 C163 41, 163 110, 100 165 C37 110, 37 41, 37 41 C37 41, 64 27, 100 27 Z" 
                fill="url(#shieldGrad)" 
                stroke="url(#glowGrad)" 
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* Spotlight lighting track moving with cursor */}
              {(coords.x !== 0 || coords.y !== 0) && (
                <path 
                  d="M100 27 C136 27, 163 41, 163 41 C163 41, 163 110, 100 165 C37 110, 37 41, 37 41 C37 41, 64 27, 100 27 Z" 
                  fill="url(#cursorGlow)" 
                  opacity="0.95"
                  style={{ mixBlendMode: 'screen' }}
                />
              )}

              {/* Floating ambient secure node bubbles */}
              <circle cx="28" cy="48" r="2.5" fill="#60a5fa" opacity="0.4" style={{ transformOrigin: 'center', animation: 'floatParticle 5s ease-in-out infinite' }} />
              <circle cx="172" cy="142" r="2" fill="#3b82f6" opacity="0.3" style={{ transformOrigin: 'center', animation: 'floatParticle 6s ease-in-out infinite 0.5s' }} />
              <circle cx="36" cy="132" r="2" fill="#38bdf8" opacity="0.5" style={{ transformOrigin: 'center', animation: 'floatParticle 4.5s ease-in-out infinite 1.2s' }} />
              <circle cx="164" cy="52" r="3" fill="#1d4ed8" opacity="0.3" style={{ transformOrigin: 'center', animation: 'floatParticle 7s ease-in-out infinite 2s' }} />

              {/* Glowing Cyber Circuit Nodes inside Shield */}
              <circle cx="100" cy="95" r="15" stroke="#60a5fa" strokeWidth="2" fill="#0f172a" />
              
              {/* Circuit paths */}
              <path d="M70 55 L100 85 L130 55" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <path d="M70 135 L100 105 L130 135" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

              <path d="M100 45 L100 79" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M100 111 L100 145" stroke="#60a5fa" strokeWidth="1.5" />
              <path d="M55 95 L84 95" stroke="#60a5fa" strokeWidth="1.5" />
              <path d="M116 95 L145 95" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
              
              <circle cx="100" cy="45" r="3.5" fill="#60a5fa" />
              <circle cx="100" cy="145" r="3.5" fill="#60a5fa" />
              <circle cx="55" cy="95" r="3.5" fill="#60a5fa" />
              <circle cx="145" cy="95" r="3.5" fill="#60a5fa" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* 2. WHY CHOOSE CYBERSHIELD */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scrollReveal}
        className="space-y-12"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Why Choose CyberShield</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Engineered around modern SaaS security principles, offering zero-trust diagnostics directly inside user clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "100% Privacy Focused",
              desc: "Cryptographic values and passwords check processes execute entirely locally. Sensitive key structures never traverse networks."
            },
            {
              title: "AI-Ready Signatures",
              desc: "Heuristic rules inspect content parameters for patterns matching high-volume social engineering and typosquatting scams."
            },
            {
              title: "Professional PDF Audits",
              desc: "Compile completed checker logs into print-ready diagnostic summaries, detailing exposure indexes and recommendations."
            }
          ].map((benefit, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 text-left space-y-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">{benefit.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 3. CORE FEATURES PREVIEW */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scrollReveal}
        className="space-y-12"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Core Defenses Preview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A small snapshot of diagnostic scanners available inside the CyberShield Security Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewFeatures.map((feat, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 hover:border-primary/40 text-left space-y-4 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-primary/5 group"
            >
              <div className="p-3 bg-slate-100/50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 w-fit group-hover:scale-105 transition-transform">
                {feat.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Link
            to="/hub"
            className="px-6 py-3 border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            Explore all CyberShield tools <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.section>

      {/* 4. HOW IT WORKS */}
      <motion.section 
        ref={howItWorksRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scrollReveal}
        className="space-y-12 scroll-mt-20"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">How It Works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Audit suspicious web vectors in three simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Vertical timeline line on desktop */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                step: "01",
                title: "Launch Sandbox Checker",
                desc: "Choose a specific tool depending on whether you want to check links, verify files, analyze QR codes, or test quiz skills."
              },
              {
                step: "02",
                title: "Scan Suspect Inputs",
                desc: "Input target strings, URLs, messages, or files. Watch our sandboxed engines run client diagnostics locally."
              },
              {
                step: "03",
                title: "Read Actions Reports",
                desc: "Analyze overall cyber exposure score logs, get mitigation advice, and download your consolidated assessment PDF."
              }
            ].map((node, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1424]/85 text-left space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-white font-black flex items-center justify-center text-sm shadow-md shadow-primary/20">
                  {node.step}
                </div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base">{node.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5. STATISTICS SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scrollReveal}
        className="glass-panel p-8 sm:p-12 rounded-3xl border-slate-200 dark:border-slate-800 bg-[#0c1322]/40 relative overflow-hidden"
      >
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            {
              target: 2400000,
              suffix: "M+",
              isLargeNumber: true,
              label: "URLs Checked"
            },
            {
              target: 99,
              suffix: "%",
              label: "Threat Detection"
            },
            {
              target: 35000,
              suffix: "K+",
              isLargeNumber: true,
              label: "Users Protected"
            },
            {
              target: 24,
              suffix: "/7",
              label: "Security Monitoring"
            }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                <AnimatedCounter 
                  target={stat.target} 
                  suffix={stat.suffix} 
                  isLargeNumber={stat.isLargeNumber} 
                />
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 6. CALL TO ACTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scrollReveal}
        className="glass-panel p-8 sm:p-12 rounded-3xl border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary/10 to-indigo-500/5 relative overflow-hidden text-center space-y-6"
      >
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Elevate Your Digital Posture Today.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Audit passwords, scan malicious landing redirects, and identify security vulnerabilities in seconds with our localized scanning hub.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link
            to="/hub"
            className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Access Security Check Hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};
export default Home;
