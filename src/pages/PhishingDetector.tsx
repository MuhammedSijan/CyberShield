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
import { aiService } from '../services/ai/aiService';

export const PhishingDetector: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempMessageEval, setTempMessageEval] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const handleSampleClick = (sample: PhishingMockSample) => {
    setMessageText(sample.text);
    setResult(null);
    setShowResults(false);
  };

  const handleAnalyze = async () => {
    if (!messageText.trim()) {
      showToast('Input Required', 'Please enter a message or select a mock sample to analyze.', 'warning');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowResults(false);

    try {
      const text = messageText.toLowerCase();
      let localRiskScore = 15;
      const localIndicators: string[] = [];

      if (text.includes('http://') || text.includes('https://')) {
        localRiskScore += 30;
        localIndicators.push("Contains hyperlinks (potential phishing links)");
      }
      if (text.includes('urgent') || text.includes('immediate') || text.includes('freeze') || text.includes('suspend') || text.includes('lock')) {
        localRiskScore += 25;
        localIndicators.push("Urgent threat indicators or fear triggers");
      }
      if (text.includes('win') || text.includes('congratulations') || text.includes('prize') || text.includes('lottery') || text.includes('lucky')) {
        localRiskScore += 20;
        localIndicators.push("Greed triggers or prize-based vectors");
      }

      // Secure server-side call
      const aiResponse = await aiService.analyzePhishing(messageText);

      let uiRiskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
      if (aiResponse.riskLevel === 'HIGH' || aiResponse.riskLevel === 'CRITICAL') {
        uiRiskLevel = 'Danger';
      } else if (aiResponse.riskLevel === 'MEDIUM') {
        uiRiskLevel = 'Suspicious';
      }

      const compositeScore = Math.max(localRiskScore, aiResponse.confidence || 0);

      const finalEval = {
        riskScore: Math.min(compositeScore, 100),
        riskLevel: uiRiskLevel,
        indicators: Array.from(new Set(localIndicators.concat(aiResponse.indicators || []))),
        recommendations: aiResponse.recommendations || [],
        explanation: aiResponse.explanation,
        aiData: aiResponse
      };

      setTempMessageEval({ finalEval, messageText });
    } catch (err: any) {
      console.error("Phishing check failed:", err);
      showToast('Scan Error', err.message || 'Could not complete security inspection.', 'danger');
      setIsLoading(false);
    }
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
                    {result.indicators.map((ind: string, idx: number) => (
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
                    {result.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Explanation Section */}
                <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 border border-indigo-500/10 rounded-xl relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Threat Analysis</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Confidence: {result.aiData?.confidence ?? 100}%
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800/40 pb-2">
                    {result.explanation}
                  </p>

                  {result.aiData?.immediateActions && result.aiData.immediateActions.length > 0 && (
                    <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-rose-550 dark:text-rose-400">Immediate Actions</span>
                      <div className="flex flex-col gap-1">
                        {result.aiData.immediateActions.map((act: string, idx: number) => (
                          <div key={idx} className="text-[10px] text-rose-600 dark:text-rose-455 font-semibold flex items-start gap-1">
                            <span className="mt-0.5 text-rose-500 font-bold">!</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
