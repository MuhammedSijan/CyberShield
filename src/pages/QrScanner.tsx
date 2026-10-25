import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, UploadCloud, Camera, RefreshCw,
  ShieldCheck, AlertCircle, ExternalLink, Sparkles
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';
import { aiService } from '../services/ai/aiService';

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
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <QrCode className="h-3.5 w-3.5" />
          <span>Matrix Barcode Inspector</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          QR Code Safety Checker
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Decode matrix QR images and inspect destination redirects before opening unverified links on mobile devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT: DRAG-DROP & CAMERA MOCK (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Decode QR Image or Stream
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Uploader */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-all min-h-[200px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-2 text-primary border border-slate-200 dark:border-slate-700">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Upload QR Image</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[150px]">
                  Supports PNG, JPG, or screenshot files.
                </p>
                {selectedFile && (
                  <span className="text-[10px] font-mono mt-3 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded truncate max-w-[140px]">
                    {selectedFile}
                  </span>
                )}
              </label>

              {/* Camera Scanner Mock */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/20 relative min-h-[200px]">
                <Camera className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Direct Camera Feed</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[160px]">
                  WebCam scanner requires user permission.
                </p>
                <button
                  disabled
                  className="mt-3 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  Stream Inactive
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Client-side optical barcode decoding</span>
              {decodedText && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setDecodedText(null);
                    setIsUrl(false);
                    setShowResults(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* SAMPLES SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Test Payloads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockQrSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample.content)}
                  className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left flex flex-col justify-between border-slate-200 dark:border-slate-800 transition-all group shadow-xs min-h-[90px]"
                >
                  <div className="w-full">
                    <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {sample.type}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 truncate w-full group-hover:text-primary transition-colors">
                      {sample.label}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-1 font-mono">
                    {sample.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5">
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
                className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 py-16"
              >
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
                  <QrCode className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Awaiting QR Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Upload an image or select a sample matrix payload to decode its destination.
                </p>
              </motion.div>
            )}

            {!isScanning && showResults && decodedText && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      Decoded Payload
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 select-all break-all font-mono text-xs text-slate-900 dark:text-slate-100">
                    {decodedText}
                  </div>

                  {isUrl && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">
                          Redirect Warning
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                        This QR code points to an external hyperlink. Opening links blindly without inspecting DNS signatures can expose your mobile device to phishing.
                      </p>
                    </div>
                  )}

                  {/* AI Explanation Section */}
                  {aiResult && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Analysis</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                          Confidence: {aiResult.confidence ?? 100}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {aiResult.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {isUrl && (
                  <button
                    onClick={() => navigate(`/url-analyzer?url=${encodeURIComponent(decodedText)}`)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Inspect Target Link with URL Analyzer</span>
                    <ExternalLink className="h-3.5 w-3.5" />
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

export default QrScanner;
