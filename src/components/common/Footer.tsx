import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t glass-panel bg-opacity-30 dark:bg-opacity-20 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/home" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Cyber<span className="text-primary">Shield</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your personal security guard. Identify online threats, analyze password security, scan QR codes, and educate yourself before you fall victim to cybercrime.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" aria-label="Github">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" aria-label="Linkedin">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Tools / Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Diagnostic Tools
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/phishing-detector" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Phishing Detector
                </Link>
              </li>
              <li>
                <Link to="/url-analyzer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  URL Safety Analyzer
                </Link>
              </li>
              <li>
                <Link to="/password-checker" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Password Strength Checker
                </Link>
              </li>
              <li>
                <Link to="/qr-scanner" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  QR Code Safety Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Cyber Hygiene Quiz
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@cybershield.io</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-primary" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} CyberShield Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span>🔒 Bank-grade local analysis</span>
            <span className="h-1 w-1 bg-primary rounded-full" />
            <span>AI-Ready Architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
