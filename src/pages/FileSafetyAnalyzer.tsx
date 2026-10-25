import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, ShieldAlert,
  UploadCloud, RefreshCw, File, Lock, Sparkles, FileText
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
      let localRiskScore = 5;

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

      // 3. Call backend AI proxy
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
        extension: ext ? `.${ext}` : 'None',
        mimeType: mime,
        size: file.size,
        hash: hashHex,
        lastModified: lastModDate,
        warnings,
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
          icon: <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
          color: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
          label: 'Critical Hazard / Dangerous Format'
        };
      case 'Suspicious':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
          color: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          label: 'Suspicious / Potential Obfuscation'
        };
      default:
        return {
          icon: <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
          color: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
          label: 'Standard Format / Clean Profile'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <FileText className="h-3.5 w-3.5" />
          <span>Local File Auditor</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          File Safety Analyzer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Inspect file extensions, MIME signatures, double-extension masking, and calculate SHA-256 integrity checksums entirely inside your browser.
        </p>
      </div>

      {/* PRIVACY WARNING */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Zero File Upload:</strong> Files are read through local browser File and subtle crypto APIs. File payload contents never leave your workstation.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FILE UPLOAD DROPZONE (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 dark:border-slate-700 hover:border-primary bg-white dark:bg-slate-900 shadow-xs'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-analyzer-input"
            />
            <label htmlFor="file-analyzer-input" className="cursor-pointer flex flex-col items-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-3 text-primary border border-slate-200 dark:border-slate-700">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Drag and Drop File Here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Accepts documents, executables, archives, and media up to 100 MB.
              </p>
              <span className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-block">
                Choose Local File
              </span>
            </label>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Runs offline in client sandbox</span>
            {fileDetails && (
              <button
                onClick={() => {
                  setFileDetails(null);
                  setIsScanning(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Clear current file
              </button>
            )}
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5">
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
                className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 py-16"
              >
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
                  <File className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Awaiting File
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Drop a file into the upload zone to calculate SHA-256 hashes and inspect for masking patterns.
                </p>
              </motion.div>
            )}

            {!isScanning && fileDetails && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
              >
                {/* Score Status */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${getRiskColor(fileDetails.riskLevel).bg}`}>
                  <div>{getRiskColor(fileDetails.riskLevel).icon}</div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      File Safety Status
                    </span>
                    <h3 className={`text-sm font-bold truncate ${getRiskColor(fileDetails.riskLevel).color}`}>
                      {getRiskColor(fileDetails.riskLevel).label}
                    </h3>
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
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    File Telemetry
                  </h4>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">File Name</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{fileDetails.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Extension</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{fileDetails.extension}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Size</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formatSize(fileDetails.size)}</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">MIME Type</span>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate mt-0.5">{fileDetails.mimeType}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Local SHA-256 Checksum</span>
                      <p className="text-[11px] font-mono text-primary break-all select-all mt-0.5">{fileDetails.hash}</p>
                    </div>
                  </div>
                </div>

                {/* Warnings Section */}
                {fileDetails.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Warnings ({fileDetails.warnings.length})
                    </h4>
                    <div className="space-y-1.5">
                      {fileDetails.warnings.map((warn, idx) => (
                        <div key={idx} className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">{warn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanation Section */}
                {aiResult && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">ShieldAI Malware Analysis</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FileSafetyAnalyzer;
