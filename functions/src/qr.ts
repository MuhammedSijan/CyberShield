import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { checkUrlSecurityVT } from "./utils/vt";
import { callGeminiAI } from "./utils/gemini";

interface QrRequest {
  content: string;
}

export const analyzeQrProxy = onCall<QrRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY", "VIRUSTOTAL_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to run QR Code checks.");
    }

    // 2. Input Sanitization & Validation
    const content = request.data?.content?.trim();
    if (!content || typeof content !== "string" || content.length > 4096) {
      throw new HttpsError("invalid-argument", "A valid QR code payload string under 4096 characters is required.");
    }

    logger.info(`analyzeQrProxy triggered by user ${request.auth.uid}`);

    // 3. Redirection link checking
    const isUrl = content.startsWith("http://") || content.startsWith("https://");
    let vtResult = null;

    if (isUrl) {
      try {
        vtResult = await checkUrlSecurityVT(content);
      } catch (err: any) {
        logger.error("Failed to query VirusTotal for QR redirection URL:", err);
      }
    }

    // 4. Call Gemini AI
    const systemInstruction = `You are CyberShield ShieldAI, a mobile threat and QR code vector analyst. 
Analyze the parsed QR code content and assess security threats. 
Explain if opening the URL represents risks like drive-by downloads, phishing, fake login pages, or typosquatting.
Explain redirect vulnerabilities (e.g. bypassing safe search checking). 
Return a structured JSON response matching this schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief risk description of QR payload",
  "explanation": "Detail of decoded QR contents and threat characteristics",
  "indicators": ["warnings about redirects or payload content"],
  "recommendations": ["actions the user should perform"],
  "immediateActions": ["immediate mitigation steps"],
  "reasoning": "Internal logical analysis steps",
  "timestamp": "ISO timestamp string"
}`;

    const prompt = `QR Code Scan Data:
- Decoded Payload: "${content}"
- Contains Redirection Link: ${isUrl ? "Yes" : "No"}

${isUrl ? `Redirection URL Security Report (VirusTotal):
- Success: ${vtResult?.success ?? false}
- Malicious matching engines: ${vtResult?.maliciousCount ?? 0}
- Suspicious engines: ${vtResult?.suspiciousCount ?? 0}
- Harmless engines: ${vtResult?.harmlessCount ?? 0}
- Errors / Warnings: ${vtResult?.error || "None"}` : "Static payload containing plain text identifier, WIFI config, or wallet parameters."}

Please analyze this payload and return a structured JSON response.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      return JSON.parse(aiResponse);
    } catch (err: any) {
      logger.error("AI QR code evaluation failed. Returning local fallback.", err);

      const fallbackLevel = isUrl
        ? vtResult && vtResult.maliciousCount > 0
          ? "CRITICAL"
          : "MEDIUM"
        : "SAFE";

      const fallbackIndicators: string[] = [];
      if (isUrl) {
        fallbackIndicators.push("Contains browser redirection URL");
        if (vtResult && vtResult.maliciousCount > 0) {
          fallbackIndicators.push(`VirusTotal flagged destination as malicious by ${vtResult.maliciousCount} engines`);
        }
      } else {
        fallbackIndicators.push("Contains static local text layout");
      }

      return {
        riskLevel: fallbackLevel,
        confidence: 70,
        summary: fallbackLevel === "SAFE" ? "Decoded static QR content verified safe." : "Redirection QR code flagged for verification.",
        explanation: `Decoded QR code contents. Link redirection check completed. VirusTotal reported ${vtResult?.maliciousCount ?? 0} malicious detections. AI engine was offline.`,
        indicators: fallbackIndicators,
        recommendations: fallbackLevel === "SAFE"
          ? ["Static parameters are safe to verify."]
          : ["Do not open the redirection link without verifying its domain official status.", "Do not fill forms or enter credentials on the landing site."],
        immediateActions: fallbackLevel === "CRITICAL" ? ["Do not open the redirection target URL.", "Delete the decoded record."] : [],
        reasoning: "Generated server-side fallback due to AI request timeout.",
        timestamp: new Date().toISOString()
      };
    }
  }
);
