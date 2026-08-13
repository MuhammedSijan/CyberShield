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

  const score = getSafetyScore();
  
  // Extract threat history
  const recentThreats = scans
    .filter(s => s.riskLevel === 'Danger' || s.riskLevel === 'Suspicious')
    .slice(0, 5)
    .map(s => `${s.type.toUpperCase()}: ${s.target} (${s.result})`);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Format chat history context for Gemini v2Callable endpoint
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
    } catch (err: any) {
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
    { label: "How to fix my security vulnerabilities?", query: "What are the top 3 items I should fix first to improve my score?" },
    { label: "How do I recognize phishing messages?", query: "What are key indicators of social engineering or phishing messages?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-left">
      <AnimatePresence>
        {/* Floating Chat Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="w-[350px] sm:w-[400px] h-[520px] bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 via-slate-900/50 to-transparent border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 border border-primary/25 rounded-lg">
                  <Shield className="h-5 w-5 text-primary animate-pulse-glow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1">
                    ShieldAI <Sparkles className="h-3 w-3 text-primary" />
                  </h3>
                  <span className="text-[10px] text-emerald-450 dark:text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cyber Analyst Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <div key={index} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex items-start gap-2 max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${isModel ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-slate-800 text-slate-350'}`}>
                        {isModel ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      </div>

                      <div className="space-y-2">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isModel 
                            ? 'bg-slate-900/40 border border-slate-800/80 text-slate-300 rounded-tl-none' 
                            : 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>

                        {/* RENDER DYNAMIC REC/ACTIONS UNDER MODEL RESPONSES */}
                        {isModel && msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 text-left max-w-full">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Recommended Guidelines
                            </span>
                            <div className="flex flex-col gap-1">
                              {msg.recommendations.map((rec, idx) => (
                                <div key={idx} className="text-[10px] text-slate-400 flex items-start gap-1">
                                  <span>✓</span>
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {isModel && msg.immediateActions && msg.immediateActions.length > 0 && (
                          <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1 text-left max-w-full">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Immediate Hazard Control
                            </span>
                            <div className="flex flex-col gap-1">
                              {msg.immediateActions.map((act, idx) => (
                                <div key={idx} className="text-[10px] text-rose-400 flex items-start gap-1 font-semibold">
                                  <span>!</span>
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

              {/* Loader */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 max-w-[85%]">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    </div>
                    <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-2xl rounded-tl-none text-[10px] text-slate-400 animate-pulse">
                      Analyzing threat signatures...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/20 space-y-1.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <HelpCircle className="h-2.5 w-2.5" /> Suggestion Queries
                </span>
                <div className="flex flex-col gap-1">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="w-full p-2 text-left bg-slate-900/60 hover:bg-primary/10 hover:text-primary border border-slate-800/80 hover:border-primary/20 text-[10px] text-slate-400 font-semibold rounded-lg transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-950/40 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ask ShieldAI security questions..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:outline-none focus:border-primary placeholder-slate-500"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-primary hover:bg-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center relative group border border-primary/30"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
        
        {/* Hover tag description */}
        <span className="absolute right-14 whitespace-nowrap bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-slate-200 border border-primary/25 rounded-lg px-2.5 py-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Consult ShieldAI
        </span>
      </motion.button>
    </div>
  );
};
