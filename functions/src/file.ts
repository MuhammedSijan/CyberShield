import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { checkFileHashVT } from "./utils/vt";
import { callGeminiAI } from "./utils/gemini";

interface FileRequest {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  hash: string;
}

export const analyzeFileProxy = onCall<FileRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY", "VIRUSTOTAL_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to run file safety audits.");
    }

    // 2. Parameters Sanitization and Validation
    const name = request.data?.name?.trim() || "";
    const extension = request.data?.extension?.trim() || "";
    const mimeType = request.data?.mimeType?.trim() || "";
    const size = request.data?.size || 0;
    const hash = request.data?.hash?.trim() || "";

    if (!name || typeof name !== "string" || name.length > 512) {
      throw new HttpsError("invalid-argument", "A valid file name string under 512 characters is required.");
    }
    if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{64}$/.test(hash)) {
      throw new HttpsError("invalid-argument", "A valid SHA-256 checksum hash is required.");
    }

    logger.info(`analyzeFileProxy triggered by user ${request.auth.uid} for file: ${name}`);

    // 3. Local Rule Matching
    const warnings: string[] = [];
    let baseScore = 5;

    const extClean = extension.replace(".", "").toLowerCase();
    const executableExts = ["exe", "apk", "bat", "com", "cmd", "sh", "app", "msi", "jar", "vbs"];
    const isExecutable = executableExts.includes(extClean);
    if (isExecutable) {
      baseScore += 55;
      warnings.push("Binary installer / executable payload type");
    }

    const archiveExts = ["zip", "rar", "tar", "gz", "7z", "iso"];
    const isArchive = archiveExts.includes(extClean);
    if (isArchive) {
      baseScore += 15;
      warnings.push("Compressed file container: files within require expansion scanning");
    }

    const doubleExt = name.split(".").length > 2;
    if (doubleExt) {
      baseScore += 30;
      warnings.push("Double extension masquerading detected");
    }

    const fileSizeMB = size / (1024 * 1024);
    if (fileSizeMB > 25) {
      baseScore += 10;
      warnings.push("Large payload size (exceeds sandbox defaults)");
    }

    // 4. VirusTotal Hash Check
    let vtResult = null;
    try {
      vtResult = await checkFileHashVT(hash);
    } catch (err: any) {
      logger.error("Failed to query VirusTotal inside analyzeFileProxy:", err);
    }

    // 5. Call Gemini AI
    const systemInstruction = `You are CyberShield ShieldAI, an expert malware forensics investigator. 
Analyze the file metadata and external scan signatures to report threat factors. 
Keep user files private: never ask to upload or process raw file content bytes. 
Evaluate indicators like double extensions, executable mime signatures, and VirusTotal detections.
Return a structured JSON response matching this schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief explanation header",
  "explanation": "Malware report details indicating safety or vulnerability",
  "indicators": ["warnings triggered during analysis"],
  "recommendations": ["actions the user should perform"],
  "immediateActions": ["immediate hazard control commands"],
  "reasoning": "Logical analysis of indicators and VT outputs",
  "timestamp": "ISO timestamp string"
}`;

    const prompt = `File Metadata Report:
- File Name: ${name}
- Extension: ${extension}
- MIME Type: ${mimeType}
- Size: ${size} bytes (${fileSizeMB.toFixed(2)} MB)
- Local SHA-256 Checksum: ${hash}
- Triggered Warnings: ${warnings.join(", ") || "None"}

VirusTotal Database Matching:
- Success: ${vtResult?.success ?? false}
- Malicious matches: ${vtResult?.maliciousCount ?? 0}
- Suspicious matches: ${vtResult?.suspiciousCount ?? 0}
- Harmless matches: ${vtResult?.harmlessCount ?? 0}
- Total scan engines queried: ${vtResult?.totalEngines ?? 0}
- Warnings / Errors: ${vtResult?.error || "None"}

Evaluate threat posture and return structured JSON response.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      return JSON.parse(aiResponse);
    } catch (err: any) {
      logger.error("AI File analysis failed. Returning local fallback.", err);

      const fallbackLevel = (vtResult && vtResult.maliciousCount > 0) || isExecutable || doubleExt
        ? "HIGH"
        : isArchive || fileSizeMB > 25
        ? "MEDIUM"
        : "SAFE";

      return {
        riskLevel: fallbackLevel,
        confidence: 75,
        summary: fallbackLevel === "SAFE" ? "No local file threats flagged." : "Potential file vulnerabilities flagged.",
        explanation: `Evaluated file attributes locally. VirusTotal database reports ${vtResult?.maliciousCount ?? 0} engine flags. Gemini service was unavailable.`,
        indicators: warnings.concat(vtResult?.maliciousCount ? [`VirusTotal flagged by ${vtResult.maliciousCount} engines`] : []),
        recommendations: fallbackLevel === "SAFE"
          ? ["File signatures indicate normal configuration attributes."]
          : ["Do not execute or install this payload.", "Scan the file using local system anti-virus software before running."],
        immediateActions: fallbackLevel === "HIGH" ? ["Delete this file from your device immediately.", "Purge the file from trash folders."] : [],
        reasoning: "Generated server-side fallback due to AI model timeout.",
        timestamp: new Date().toISOString()
      };
    }
  }
);
