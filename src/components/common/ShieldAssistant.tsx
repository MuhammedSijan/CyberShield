import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, X, Sparkles, Shield, AlertTriangle, CheckCircle, RefreshCw, User, HelpCircle
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { aiService } from '../../services/ai/aiService';
import type { ChatMessage } from '../../services/ai/aiTypes';

export const ShieldAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string; recommendations?: string[]; immediateActions?: string[] }>>([
    {
      role: 'model',
      text: 'Greetings. I am ShieldAI, your personal cybersecurity analyst assistant. Ask me questions about phishing, password health, malware, safe browsing, or how to improve your CyberShield security score.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { scans, getSafetyScore } = useSecurity();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const score = getSafetyScore();
  
  // Extract threat history
  const recentThreats = scans
    .filter(s => s.riskLevel === 'Danger' || s.riskLevel === 'Suspicious')
    .slice(0, 5)
    .map(s => `${s.type.toUpperCase()}: ${s.target} (${s.result})`);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input and listen for Escape key when open
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 150);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Format chat history context for Gemini endpoint
    const historyList: ChatMessage[] = messages.map(m => ({
      role: m.role,
      text: m.text
    }));

    try {
      const response = await aiService.askSecurityAssistant(
        userMessage,
        historyList,
        score,
        recentThreats
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: response.answer,
          recommendations: response.recommendations,
          immediateActions: response.immediateActions
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Connection to ShieldAI service lost. Please try again shortly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Why is my security score low?", query: "Why is my security score low? What does it represent?" },
    { label: "How to fix my vulnerabilities?", query: "What are the top 3 items I should fix first to improve my score?" },
    { label: "How do I spot phishing?", query: "What are key indicators of social engineering or phishing messages?" }
  ];

  return (
    <>
      {/* Backdrop overlay for drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shieldai-title"
            className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col font-sans text-left"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="shieldai-title" className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    ShieldAI Analyst <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Local Sandbox Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close ShieldAI drawer"
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#0b0f19]">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={index} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex items-start gap-2.5 max-w-[88%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isModel 
                          ? 'bg-primary/10 border border-primary/20 text-primary' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {isModel ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      </div>

                      <div className="space-y-2">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isModel 
                            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs' 
                            : 'bg-primary text-white rounded-tr-none shadow-xs'
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>

                        {/* RENDER DYNAMIC RECOMMENDATIONS */}
                        {isModel && msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" /> Recommended Guidelines
                            </span>
                            <div className="flex flex-col gap-1">
                              {msg.recommendations.map((rec, idx) => (
                                <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RENDER DYNAMIC IMMEDIATE ACTIONS */}
                        {isModel && msg.immediateActions && msg.immediateActions.length > 0 && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1.5 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" /> Immediate Hazard Control
                            </span>
                            <div className="flex flex-col gap-1">
                              {msg.immediateActions.map((act, idx) => (
                                <div key={idx} className="text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-1.5 font-medium">
                                  <span className="font-bold">!</span>
                                  <span>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 max-w-[85%]">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-500 dark:text-slate-400">
                      Analyzing security signatures...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Quick Inquiries
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="w-full p-2 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary border border-slate-200 dark:border-slate-800 hover:border-primary/30 text-xs text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ask ShieldAI security questions..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                className="p-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl transition-all shadow-xs flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open ShieldAI security assistant drawer"
          className="p-3.5 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary-dark text-white rounded-full shadow-lg border border-slate-700 dark:border-primary/30 flex items-center justify-center relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          
          <span className="hidden sm:inline-block absolute right-14 whitespace-nowrap bg-slate-900 text-[11px] font-semibold text-white rounded-lg px-2.5 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ShieldAI Analyst
          </span>
        </button>
      </div>
    </>
  );
};
