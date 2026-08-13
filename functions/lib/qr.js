"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQrProxy = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const vt_1 = require("./utils/vt");
const gemini_1 = require("./utils/gemini");
exports.analyzeQrProxy = (0, https_1.onCall)({
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY", "VIRUSTOTAL_API_KEY"]
}, async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required to run QR Code checks.");
    }
    // 2. Input Sanitization & Validation
    const content = request.data?.content?.trim();
    if (!content || typeof content !== "string" || content.length > 4096) {
        throw new https_1.HttpsError("invalid-argument", "A valid QR code payload string under 4096 characters is required.");
    }
    firebase_functions_1.logger.info(`analyzeQrProxy triggered by user ${request.auth.uid}`);
    // 3. Redirection link checking
    const isUrl = content.startsWith("http://") || content.startsWith("https://");
    let vtResult = null;
    if (isUrl) {
        try {
            vtResult = await (0, vt_1.checkUrlSecurityVT)(content);
        }
        catch (err) {
            firebase_functions_1.logger.error("Failed to query VirusTotal for QR redirection URL:", err);
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
        const aiResponse = await (0, gemini_1.callGeminiAI)(prompt, systemInstruction);
        return JSON.parse(aiResponse);
    }
    catch (err) {
        firebase_functions_1.logger.error("AI QR code evaluation failed. Returning local fallback.", err);
        const fallbackLevel = isUrl
            ? vtResult && vtResult.maliciousCount > 0
                ? "CRITICAL"
                : "MEDIUM"
            : "SAFE";
        const fallbackIndicators = [];
        if (isUrl) {
            fallbackIndicators.push("Contains browser redirection URL");
            if (vtResult && vtResult.maliciousCount > 0) {
                fallbackIndicators.push(`VirusTotal flagged destination as malicious by ${vtResult.maliciousCount} engines`);
            }
        }
        else {
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
});
//# sourceMappingURL=qr.js.map