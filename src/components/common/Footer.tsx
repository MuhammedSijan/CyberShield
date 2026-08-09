import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-805 bg-slate-100/40 dark:bg-[#070b13]/60 backdrop-blur-md mt-auto transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Cyber<span className="text-primary text-glow-primary">Shield</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Securing everyday digital environments. Evaluate phishing links, verify password strength metrics, check files, and scan QR codes locally inside your sandbox browser.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-350 uppercase tracking-widest mb-4">
              Diagnostic Hub
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: "Phishing Checker", path: "/phishing-detector" },
                { name: "URL Analyzer", path: "/url-analyzer" },
                { name: "Credential Health", path: "/password-checker" },
                { name: "Code Scanner", path: "/qr-scanner" },
                { name: "File Auditing", path: "/file-analyzer" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate Support */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-350 uppercase tracking-widest mb-4">
              Enterprise
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  About CyberShield
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Hygiene Quiz
                </Link>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Privacy Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-350 uppercase tracking-widest mb-4">
              Operational Office
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@cybershield.io</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom social row */}
        <div className="border-t border-slate-200 dark:border-slate-850 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} CyberShield Inc. All rights reserved.
            </p>
            <span className="hidden sm:inline h-1.5 w-1.5 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span>🔒 Local sandboxed operations</span>
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-500 transition-colors"
              title="LinkedIn Placeholder"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* Portfolio */}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
              title="Portfolio"
            >
              <svg className="h-4.5 w-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
