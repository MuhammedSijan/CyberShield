import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ShieldCheck, AlertTriangle, 
  RefreshCw, ArrowRight, AlertOctagon, Sparkles 
} from 'lucide-react';
import { phishingSamples } from '../data/mockData';
import type { PhishingMockSample } from '../data/mockData';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';

export const PhishingDetector: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempMessageEval, setTempMessageEval] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<PhishingMockSample['evaluation'] | null>(null);
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const handleSampleClick = (sample: PhishingMockSample) => {
    setMessageText(sample.text);
    setResult(null);
    setShowResults(false);
  };

  const handleAnalyze = () => {
    if (!messageText.trim()) {
      showToast('Input Required', 'Please enter a message or select a mock sample to analyze.', 'warning');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowResults(false);

    // Find matching mock sample if there is one, otherwise generate generic response
    const matched = phishingSamples.find(s => 
      messageText.toLowerCase().includes(s.text.substring(0, 30).toLowerCase())
    );

    let finalEval: PhishingMockSample['evaluation'];

    if (matched) {
      finalEval = matched.evaluation;
    } else {
      // Fallback generic scanner
      const text = messageText.toLowerCase();
      let riskScore = 15;
      const indicators = [];
      const recommendations = [
        "Do not share personal details, credit cards, or logins via this link.",
        "Check details directly with the official brand support portal if unsure."
      ];

      if (text.includes('http://') || text.includes('https://')) {
        riskScore += 30;
        indicators.push("Contains hyperlinks which might direct to malicious gateways.");
      }
      if (text.includes('urgent') || text.includes('immediate') || text.includes('freeze') || text.includes('suspend') || text.includes('lock')) {
        riskScore += 25;
        indicators.push("Contains urgent action words ('immediate', 'freeze', 'suspend') creating social panic.");
        recommendations.push("Observe caution: urgent requests are common signatures of credit harvesting.");
      }
      if (text.includes('win') || text.includes('congratulations') || text.includes('prize') || text.includes('lottery') || text.includes('lucky')) {
        riskScore += 20;
        indicators.push("Promises financial or materialistic prizes ('congratulations', 'win').");
        recommendations.push("Avoid clicking lottery references; companies do not raffle gifts through cold communication.");
      }

      let riskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
      if (riskScore > 65) {
        riskLevel = 'Danger';
      } else if (riskScore > 30) {
        riskLevel = 'Suspicious';
      }

      finalEval = {
        riskScore,
        riskLevel,
        indicators: indicators.length > 0 ? indicators : ["No standard automated indicators detected, verify sender credentials."],
        recommendations,
        explanation: `Automated rule matches flagged ${indicators.length} primary signature(s). The language patterns suggest a ${riskScore}% probability of threat manipulation.`
      };
    }

    setTempMessageEval({ finalEval, messageText });
  };

  const handleScanComplete = () => {
    if (!tempMessageEval) return;
    const { finalEval, messageText: textVal } = tempMessageEval;
    
    setResult(finalEval);
    setIsLoading(false);
    setShowResults(true);

    const cleanTarget = textVal.length > 30 
      ? `${textVal.substring(0, 30)}...` 
      : textVal;
    addScan('phishing', cleanTarget, finalEval.riskLevel === 'Safe' ? 'Verified Clean' : 'Potential Fraud', finalEval.riskScore, finalEval.riskLevel);
    showToast('Analysis Completed', 'Suspicious payload parsed successfully.', 'success');
  };

  useEffect(() => {
    // Hide old results if user changes the text input
    setShowResults(false);
  }, [messageText]);

  const getRiskDetails = (level: string) => {
    switch (level) {
      case 'Danger':
        return {
          icon: <AlertOctagon className="h-8 w-8 text-rose-500" />,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10 border-rose-500/25',
          label: 'Critical Danger'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/25',
          label: 'Suspicious / Risk Flag'
        };
      default:
        return {
          icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/25',
          label: 'Verified / Low Risk'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Phishing Message Detector</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Paste emails, SMS, or WhatsApp posts to extract structural threat elements and evaluate safety levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Paste Suspicious Message</h3>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste email headers, SMS texts, or chat message body here..."
              rows={8}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-600"
            />

            <div className="flex flex-wrap gap-2 justify-between items-center">
              <button
                onClick={() => {
                  setMessageText('');
                  setResult(null);
                  setShowResults(false);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
              >
                {isLoading ? 'Scanning...' : 'Analyze Message'} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Interactive Test Samples
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phishingSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="p-4 rounded-xl border glass-panel glass-panel-hover text-left flex flex-col justify-between h-28 border-slate-200 dark:border-slate-800/60"
                >
                  <div className="w-full">
                    <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {sample.source}
                    </span>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                      {sample.label}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full mt-1">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isLoading && (
              <StepProgressScanner onComplete={handleScanComplete} />
            )}

            {!isLoading && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-405 dark:text-slate-650" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Awaiting Evaluation</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px]">
                  Paste a suspicious message or click a template card to view detailed risk statistics.
                </p>
              </motion.div>
            )}

            {!isLoading && showResults && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6"
              >
                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${getRiskDetails(result.riskLevel).bg}`}>
                  <div>{getRiskDetails(result.riskLevel).icon}</div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Risk Status</span>
                    <h4 className={`text-base font-bold leading-none ${getRiskDetails(result.riskLevel).color}`}>
                      {getRiskDetails(result.riskLevel).label}
                    </h4>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                    <span className={`${getRiskDetails(result.riskLevel).color} font-bold`}>{result.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        result.riskLevel === 'Danger' 
                          ? 'bg-rose-500' 
                          : result.riskLevel === 'Suspicious' 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Indicators */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Suspicious Indicators
                  </h4>
                  <ul className="space-y-2">
                    {result.indicators.map((ind, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
                        <span className="text-rose-500 font-bold mt-0.5">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Security Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Explanation Placeholder */}
                <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 border border-indigo-500/10 rounded-xl relative overflow-hidden space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">AI Threat Explanation</span>
                  </div>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                    {result.explanation}
                  </p>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded w-fit mt-1">
                    AI Integration Coming Soon
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
