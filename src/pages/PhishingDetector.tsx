import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ShieldCheck, AlertTriangle,
  RefreshCw, ArrowRight, AlertOctagon, Sparkles, CheckCircle2
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
      showToast('Input Required', 'Please enter a message or select a test sample to analyze.', 'warning');
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

      // Secure backend proxy call
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

    const cleanTarget = textVal.length > 30 ? `${textVal.substring(0, 30)}...` : textVal;
    addScan('phishing', cleanTarget, finalEval.riskLevel === 'Safe' ? 'Verified Clean' : 'Potential Fraud', finalEval.riskScore, finalEval.riskLevel);
    showToast('Analysis Completed', 'Message content analyzed successfully.', 'success');
  };

  useEffect(() => {
    setShowResults(false);
  }, [messageText]);

  const getRiskDetails = (level: string) => {
    switch (level) {
      case 'Danger':
        return {
          icon: <AlertOctagon className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
          color: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
          label: 'Critical Hazard / Social Engineering'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
          color: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          label: 'Suspicious / Coercion Patterns'
        };
      default:
        return {
          icon: <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
          color: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
          label: 'Verified / Low Threat Indicator'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Message Safety Classifier</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Phishing Message Detector
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Inspect email headers, SMS text alerts, or social direct messages for social engineering indicators, artificial urgency, and fraudulent links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT & SAMPLES (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Message Payload Text
            </h2>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste email headers, SMS text, or chat message body here..."
              rows={7}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed font-sans"
            />

            <div className="flex flex-wrap gap-2 justify-between items-center pt-1">
              <button
                onClick={() => {
                  setMessageText('');
                  setResult(null);
                  setShowResults(false);
                }}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Input
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                {isLoading ? 'Scanning...' : 'Analyze Message'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Test Samples
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phishingSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="p-4 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left flex flex-col justify-between border-slate-200 dark:border-slate-800 transition-all group shadow-xs min-h-[110px]"
                >
                  <div className="w-full">
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {sample.source}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2 truncate w-full group-hover:text-primary transition-colors">
                      {sample.label}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full mt-2">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5">
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
                className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 py-16"
              >
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Awaiting Input
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Paste a suspect message or select a sample to inspect for coercion patterns and spoofed links.
                </p>
              </motion.div>
            )}

            {!isLoading && showResults && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
              >
                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${getRiskDetails(result.riskLevel).bg}`}>
                  <div>{getRiskDetails(result.riskLevel).icon}</div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Threat Assessment
                    </span>
                    <h3 className={`text-sm font-bold ${getRiskDetails(result.riskLevel).color}`}>
                      {getRiskDetails(result.riskLevel).label}
                    </h3>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                    <span className={`${getRiskDetails(result.riskLevel).color} font-bold`}>
                      {result.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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
                {result.indicators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Detected Threat Indicators
                    </h4>
                    <div className="space-y-1.5">
                      {result.indicators.map((ind: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                          <span className="font-bold text-rose-500">•</span>
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Mitigation Advice
                    </h4>
                    <div className="space-y-1.5">
                      {result.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Analysis</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      Confidence: {result.aiData?.confidence ?? 100}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PhishingDetector;
