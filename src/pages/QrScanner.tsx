import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, UploadCloud, Camera, RefreshCw, 
  ShieldCheck, AlertCircle, ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';
import { aiService } from '../services/ai/aiService';
import { Sparkles } from 'lucide-react';

export const QrScanner: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tempQrContent, setTempQrContent] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isUrl, setIsUrl] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const mockQrSamples = [
    {
      id: 'qr1',
      label: 'Corporate Wi-Fi Profile (Safe)',
      content: 'WIFI:S:Office_Secure;T:WPA;P:K39d!s@9a;;',
      type: 'text'
    },
    {
      id: 'qr2',
      label: 'Official Google Portal (Safe Link)',
      content: 'https://google.com',
      type: 'url'
    },
    {
      id: 'qr3',
      label: 'Urgent PayPal Redirect (Phishing Link)',
      content: 'http://secure-paypal-login-update.com/verify-identity',
      type: 'url'
    },
    {
      id: 'qr4',
      label: 'Crypto Wallet Address (Plain Text)',
      content: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      type: 'text'
    }
  ];

  const handleSampleClick = (content: string) => {
    setSelectedFile('Mock-Sample-QR.png');
    triggerScan(content);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file.name);
      const randomContent = mockQrSamples[Math.floor(Math.random() * mockQrSamples.length)].content;
      triggerScan(randomContent);
    }
  };

  const triggerScan = async (content: string) => {
    setTempQrContent(content);
    setIsScanning(true);
    setDecodedText(null);
    setIsUrl(false);
    setShowResults(false);
    setAiResult(null);

    try {
      const aiResponse = await aiService.analyzeQr(content);
      setAiResult(aiResponse);
    } catch (err: any) {
      console.error("AI QR scan failed:", err);
    }
  };

  const handleScanComplete = () => {
    setDecodedText(tempQrContent);
    setIsScanning(false);
    setShowResults(true);
    
    const parsedIsUrl = tempQrContent.startsWith('http://') || tempQrContent.startsWith('https://');
    setIsUrl(parsedIsUrl);

    // Mapped risk levels
    let riskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
    let riskScore = 5;

    if (aiResult) {
      if (aiResult.riskLevel === 'HIGH' || aiResult.riskLevel === 'CRITICAL') {
        riskLevel = 'Danger';
      } else if (aiResult.riskLevel === 'MEDIUM') {
        riskLevel = 'Suspicious';
      }
      riskScore = aiResult.confidence || (parsedIsUrl ? 40 : 5);
    } else {
      riskLevel = parsedIsUrl ? 'Suspicious' : 'Safe';
      riskScore = parsedIsUrl ? 40 : 5;
    }

    // Log check in security context
    const cleanTarget = tempQrContent.length > 25 ? `${tempQrContent.substring(0, 25)}...` : tempQrContent;
    addScan(
      'qr',
      cleanTarget,
      parsedIsUrl ? 'Redirection URL Decoded' : 'Plain Text Decoded',
      riskScore,
      riskLevel
    );

    showToast('Scan Completed', 'QR Code payload safety evaluated.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">QR Code Safety Checker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload QR code images to securely decode content and pre-scan suspicious landing links before opening them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT: DRAG-DROP & CAMERA MOCK */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Decode QR Image</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Uploader */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/55 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-900/10 transition-all min-h-[220px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-655 mb-3" />
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Upload QR Image</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 max-w-[150px]">
                  Supports PNG, JPG, or SVG snapshots.
                </p>
                {selectedFile && (
                  <span className="text-[9px] font-mono mt-3 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded truncate max-w-[140px]">
                    {selectedFile}
                  </span>
                )}
              </label>

              {/* Camera Scanner Mock */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-100/50 dark:bg-slate-950/20 relative overflow-hidden min-h-[220px]">
                <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                
                <Camera className="h-10 w-10 text-slate-400 dark:text-slate-655 mb-3" />
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Camera Scan Placeholder</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 max-w-[160px]">
                  Real camera scanning will leverage device capture API.
                </p>
                
                <button
                  disabled
                  className="mt-4 px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg cursor-not-allowed"
                >
                  Start Live Feed
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setDecodedText(null);
                  setIsUrl(false);
                  setShowResults(false);
                }}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" /> Reset Checker
              </button>
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Interactive Mock QR Codes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockQrSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample.content)}
                  className="p-4 rounded-xl border glass-panel glass-panel-hover text-left flex flex-col justify-between h-24 border-slate-200 dark:border-slate-800/60"
                >
                  <div className="w-full">
                    <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded ${
                      sample.type === 'url' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {sample.type}
                    </span>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                      {sample.label}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full mt-1 font-mono">
                    {sample.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isScanning && (
              <StepProgressScanner onComplete={handleScanComplete} />
            )}

            {!isScanning && !showResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-full mb-4">
                  <QrCode className="h-8 w-8 text-slate-405 dark:text-slate-655" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Awaiting QR Check</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px]">
                  Drop a QR file, upload an image, or click one of the interactive templates to scan.
                </p>
              </motion.div>
            )}

            {!isScanning && showResults && decodedText && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Decoded Content</h3>
                  </div>

                  <div className="p-3.5 bg-slate-105 dark:bg-slate-800/45 rounded-xl border border-slate-205 dark:border-slate-800/60 select-all break-all font-mono text-xs text-slate-700 dark:text-slate-250">
                    {decodedText}
                  </div>

                  {isUrl && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-[10px] font-bold text-amber-605 dark:text-amber-500 uppercase">Redirect Warning</span>
                      </div>
                      <p className="text-[10px] text-slate-655 dark:text-slate-400 leading-relaxed">
                        This QR code points to a website. Opening links from unknown QR codes bypassing standard DNS checks is highly risky.
                      </p>
                    </div>
                  )}

                  {/* AI Explanation Section */}
                  {aiResult && (
                    <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 border border-indigo-500/10 rounded-xl relative overflow-hidden space-y-3">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Security Analysis</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Confidence: {aiResult.confidence ?? 100}%
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800/40 pb-2">
                        {aiResult.explanation}
                      </p>

                      {aiResult.indicators && aiResult.indicators.length > 0 && (
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-505 dark:text-rose-400">Threat Indicators</span>
                          <div className="flex flex-col gap-1">
                            {aiResult.indicators.map((ind: string, idx: number) => (
                              <div key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span>{ind}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                        <div className="space-y-1 text-left pt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Advisory Tips</span>
                          <div className="flex flex-col gap-1">
                            {aiResult.recommendations.map((rec: string, idx: number) => (
                              <div key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiResult.immediateActions && aiResult.immediateActions.length > 0 && (
                        <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1 text-left">
                          <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-455">Immediate Mitigation</span>
                          <div className="flex flex-col gap-1">
                            {aiResult.immediateActions.map((act: string, idx: number) => (
                              <div key={idx} className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-start gap-1">
                                <span className="mt-0.5 text-rose-500 font-bold">!</span>
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUrl && (
                  <button
                    onClick={() => navigate(`/url-analyzer?url=${encodeURIComponent(decodedText)}`)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-primary/20"
                  >
                    Analyze URL Manually <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
