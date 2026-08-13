import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, 
  UploadCloud, RefreshCw, File, Info, Sparkles
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';
import { StepProgressScanner } from '../components/common/StepProgressScanner';
import { aiService } from '../services/ai/aiService';

interface FileDetails {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  hash: string;
  lastModified: string;
  warnings: string[];
  riskScore: number;
  riskLevel: 'Safe' | 'Suspicious' | 'Danger';
}

export const FileSafetyAnalyzer: React.FC = () => {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tempFileEval, setTempFileEval] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const calculateSHA256 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileAnalyze = async (file: File) => {
    setIsScanning(true);
    setFileDetails(null);
    setAiResult(null);

    try {
      const nameParts = file.name.split('.');
      const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
      const mime = file.type || 'unknown/binary';
      const lastModDate = new Date(file.lastModified).toLocaleString();
      const fileSizeMB = file.size / (1024 * 1024);

      // 1. Calculate real hash locally
      const hashHex = await calculateSHA256(file);

      // 2. Perform risk scanning
      const warnings: string[] = [];
      let localRiskScore = 5; // Base score

      // Executables check
      const executableExts = ['exe', 'apk', 'bat', 'com', 'cmd', 'sh', 'app', 'msi', 'jar', 'vbs'];
      const isExecutable = executableExts.includes(ext);
      if (isExecutable) {
        localRiskScore += 55;
        warnings.push("Executable Payload: This file contains binary installer payloads capable of executing local system modifications.");
      }

      // Compressed archive check
      const archiveExts = ['zip', 'rar', 'tar', 'gz', '7z', 'iso'];
      const isArchive = archiveExts.includes(ext);
      if (isArchive) {
        localRiskScore += 15;
        warnings.push("Compressed Archive Container: Contents are packed. Scan inside the package before running files.");
      }

      // Double extension check
      const isDoubleExtension = nameParts.length > 2;
      if (isDoubleExtension) {
        localRiskScore += 30;
        warnings.push(`Spoofed Extension Format: File is formatted with double indicators (${file.name}). This technique is commonly used to mask executables as media.`);
      }

      // Large file check
      if (fileSizeMB > 25) {
        localRiskScore += 10;
        warnings.push(`Large File Payload: File size exceeds 25 MB (${fileSizeMB.toFixed(2)} MB), which might bypass standard sandboxing scanners.`);
      }

      // 3. Call secure backend proxy
      const aiResponse = await aiService.analyzeFile({
        name: file.name,
        extension: ext ? `.${ext}` : '',
        mimeType: mime,
        size: file.size,
        hash: hashHex
      });

      setAiResult(aiResponse);

      let uiRiskLevel: FileDetails['riskLevel'] = 'Safe';
      if (aiResponse.riskLevel === 'HIGH' || aiResponse.riskLevel === 'CRITICAL') {
        uiRiskLevel = 'Danger';
      } else if (aiResponse.riskLevel === 'MEDIUM') {
        uiRiskLevel = 'Suspicious';
      }

      const compositeScore = Math.max(localRiskScore, aiResponse.confidence || 0);

      const evalInfo: FileDetails = {
        name: file.name,
        extension: ext ? `.${ext}` : 'No Extension',
        mimeType: mime,
        size: file.size,
        hash: hashHex,
        lastModified: lastModDate,
        warnings: Array.from(new Set(warnings.concat(aiResponse.indicators || []))),
        riskScore: Math.min(compositeScore, 100),
        riskLevel: uiRiskLevel
      };

      setTempFileEval({ file, evalInfo });
    } catch (err: any) {
      setIsScanning(false);
      console.error("File analysis failed:", err);
      showToast('Analysis Error', err.message || 'Failed to inspect file payload.', 'danger');
    }
  };

  const handleScanComplete = () => {
    if (!tempFileEval) return;
    const { file, evalInfo } = tempFileEval;

    setFileDetails(evalInfo);
    setIsScanning(false);

    // Save scan to global context reports
    addScan(
      'file',
      file.name,
      `${evalInfo.extension.toUpperCase()} • ${evalInfo.riskLevel}`,
      evalInfo.riskScore,
      evalInfo.riskLevel
    );

    showToast('File Scan Completed', 'File metadata and cryptographic hash evaluated locally.', 'success');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileAnalyze(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileAnalyze(e.target.files[0]);
    }
  };



  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Danger':
        return {
          icon: <ShieldAlert className="h-8 w-8 text-rose-500 animate-pulse" />,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10 border-rose-500/25',
          label: 'Danger / Threats Identified'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/25',
          label: 'Caution / Sandbox Alert'
        };
      default:
        return {
          icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/25',
          label: 'Safe / Low Threat'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">File Safety Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Perform a local diagnostic audit of file extensions, MIME signatures, file sizes, and client-side SHA-256 checksum hashes.
        </p>
      </div>

      {/* PRIVACY WARNING */}
      <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10 dark:bg-blue-500/5 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-800 dark:text-white">🔒 Client-Side Cryptography:</span> Files are parsed entirely inside your browser sandbox. File bytes are never uploaded or stored on any server.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FILE UPLOAD CONTAINER */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-slate-200 dark:border-slate-800 hover:border-primary/60 bg-slate-100/10 dark:bg-slate-900/10'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-analyzer-input"
            />
            <label htmlFor="file-analyzer-input" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="h-14 w-14 text-slate-400 dark:text-slate-600 mb-4 animate-bounce-slow" />
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                Drag and Drop File Here
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                Accepts ZIP, RAR, PDF, DOCX, XLSX, PPTX, EXE, APK, images, and text files. Max payload size: 100 MB.
              </p>
              <span className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 hover:bg-primary-dark">
                Choose File Local
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFileDetails(null);
                setIsScanning(false);
              }}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" /> Reset Scan
            </button>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {isScanning && (
              <StepProgressScanner onComplete={handleScanComplete} />
            )}

            {!isScanning && !fileDetails && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 rounded-2xl border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-full mb-4">
                  <File className="h-8 w-8 text-slate-405 dark:text-slate-655" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Awaiting File Upload</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px]">
                  Drop a file in the scan zone to generate client-side security profiles.
                </p>
              </motion.div>
            )}

            {!isScanning && fileDetails && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6"
              >
                {/* Score Status */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${getRiskColor(fileDetails.riskLevel).bg}`}>
                  <div>{getRiskColor(fileDetails.riskLevel).icon}</div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Threat Level</span>
                    <h4 className={`text-sm font-bold truncate leading-none ${getRiskColor(fileDetails.riskLevel).color}`}>
                      {getRiskColor(fileDetails.riskLevel).label}
                    </h4>
                  </div>
                </div>

                {/* Score Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                    <span className={`${getRiskColor(fileDetails.riskLevel).color} font-bold`}>
                      {fileDetails.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        fileDetails.riskLevel === 'Danger' 
                          ? 'bg-rose-500' 
                          : fileDetails.riskLevel === 'Suspicious' 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fileDetails.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Metadata List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    File Metadata
                  </h4>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">File Name</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{fileDetails.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Extension</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{fileDetails.extension}</p>
                      </div>
                      <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">File Size</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatSize(fileDetails.size)}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">MIME Type</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{fileDetails.mimeType}</p>
                    </div>

                    <div className="p-3 bg-slate-105 dark:bg-slate-800/40 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Local SHA-256 Hash</span>
                      <p className="text-[10px] font-mono font-bold text-primary break-all select-all">{fileDetails.hash}</p>
                    </div>
                  </div>
                </div>

                {/* Warnings Section */}
                {fileDetails.warnings.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Security Warnings ({fileDetails.warnings.length})
                    </h4>
                    <div className="space-y-2">
                      {fileDetails.warnings.map((warn, idx) => (
                        <div key={idx} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{warn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation Section */}
                {aiResult && (
                  <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 border border-indigo-500/10 rounded-xl relative overflow-hidden space-y-3">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Malware Analysis</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Confidence: {aiResult.confidence ?? 100}%
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800/40 pb-2">
                      {aiResult.explanation}
                    </p>

                    {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                      <div className="space-y-1 text-left pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">AI Recommendations</span>
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
                      <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-505 dark:text-rose-400">Immediate Hazards Remediation</span>
                        <div className="flex flex-col gap-1">
                          {aiResult.immediateActions.map((act: string, idx: number) => (
                            <div key={idx} className="text-[10px] text-rose-600 dark:text-rose-455 font-semibold flex items-start gap-1">
                              <span className="mt-0.5 text-rose-550 font-bold">!</span>
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
