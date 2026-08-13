import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { checkUrlSecurityVT } from "./utils/vt";
import { callGeminiAI } from "./utils/gemini";

interface UrlRequest {
  url: string;
}

export const analyzeUrlProxy = onCall<UrlRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY", "VIRUSTOTAL_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to run URL safety scans.");
    }

    // 2. Input Sanitization & Validation
    const url = request.data?.url?.trim();
    if (!url || typeof url !== "string" || url.length > 2048) {
      throw new HttpsError("invalid-argument", "A valid URL string under 2048 characters is required.");
    }

    logger.info(`analyzeUrlProxy execution triggered by user ${request.auth.uid} for URL: ${url}`);

    // 3. Local Deterministic Check Telemetry
    const lowerUrl = url.toLowerCase();
    const hasHttps = lowerUrl.startsWith("https://");
    const keywords = ["paypal", "secure", "bank", "login", "update", "verify", "account", "signin", "support", "recovery"];
    const foundKeywords = keywords.filter((kw) => lowerUrl.includes(kw));
    const cleanHost = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    const isIp = /^[0-9.]+$/.test(cleanHost.replace(/:[0-9]+$/, ""));
    const subdomains = cleanHost.split(".").length - 2;
    const subdomainCount = subdomains > 0 ? subdomains : 0;
    const typosquattingDetected = lowerUrl.includes("0") || lowerUrl.includes("rn") || lowerUrl.includes("vv") || lowerUrl.includes("g00g") || lowerUrl.includes("paypaI");

    // 4. External Intelligence Check (VirusTotal)
    let vtResult = null;
    try {
      vtResult = await checkUrlSecurityVT(url);
    } catch (err: any) {
      logger.error("Failed to query VirusTotal inside analyzeUrlProxy:", err);
    }

    // 5. Build AI Prompt and System Instruction
    const systemInstruction = `You are CyberShield ShieldAI, an expert cybersecurity analysis assistant. 
Analyze the provided URL safety telemetry and return a structured JSON response. 
Analyze the local rules and VirusTotal engines reports to interpret the risk level. 
Be realistic and professional: do not say a URL is "100% safe" or "malicious" without evidence. 
Your response MUST be valid JSON matching this exact typescript schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief summary of the threat state",
  "explanation": "Detail of findings and indicators why it is risky or safe",
  "indicators": ["specific warning indicators found"],
  "recommendations": ["what the user should do"],
  "immediateActions": ["actions required immediately (e.g. close tab, change password)"],
  "reasoning": "Internal logical analysis steps",
  "timestamp": "ISO timestamp string"
}`;

    const prompt = `URL Safety Scan Telemetry:
- Target URL: ${url}
- Protocol: ${hasHttps ? "HTTPS (Encrypted)" : "HTTP (Unencrypted / Risky)"}
- Hostname: ${cleanHost}
- Is IP Address Host: ${isIp}
- Subdomains count: ${subdomainCount}
- Flagged Brand Keywords: ${foundKeywords.join(", ") || "None"}
- Typosquatting Check: ${typosquattingDetected ? "Suspicious pattern flagged (e.g. letter/number swapping)" : "No common swaps flagged"}

VirusTotal External Scan Data:
- Success: ${vtResult?.success ?? false}
- Malicious engines matching: ${vtResult?.maliciousCount ?? 0}
- Suspicious engines matching: ${vtResult?.suspiciousCount ?? 0}
- Harmless engines matching: ${vtResult?.harmlessCount ?? 0}
- Total scan engines queried: ${vtResult?.totalEngines ?? 0}
- Error / Warnings: ${vtResult?.error || "None"}

Please evaluate these signals. Return a structured JSON response matching the schema.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      const parsed = JSON.parse(aiResponse);

      // Sanitize risk level if Gemini returns invalid casing/values
      const allowedLevels = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
      if (!allowedLevels.includes(parsed.riskLevel)) {
        parsed.riskLevel = vtResult && vtResult.maliciousCount > 0 ? "HIGH" : "MEDIUM";
      }

      return parsed;
    } catch (err: any) {
      logger.error("AI URL analysis failed or returned malformed JSON. Falling back to deterministic rules.", err);

      // Graceful fallback containing local + VT intelligence
      const fallbackRisk = (vtResult && vtResult.maliciousCount > 0) || isIp || (typosquattingDetected && subdomainCount > 2)
        ? "CRITICAL"
        : typosquattingDetected || !hasHttps || foundKeywords.length > 0
        ? "MEDIUM"
        : "SAFE";

      const fallbackIndicators: string[] = [];
      if (!hasHttps) fallbackIndicators.push("Insecure connection (HTTP)");
      if (isIp) fallbackIndicators.push("Numeric IP host instead of domain name");
      if (typosquattingDetected) fallbackIndicators.push("Potential typosquatting swap flagged");
      if (foundKeywords.length > 0) fallbackIndicators.push(`Contains potential spoof keywords: ${foundKeywords.join(", ")}`);
      if (vtResult && vtResult.maliciousCount > 0) {
        fallbackIndicators.push(`VirusTotal flagged as malicious by ${vtResult.maliciousCount} engines`);
      }

      return {
        riskLevel: fallbackRisk,
        confidence: 80,
        summary: fallbackRisk === "SAFE" ? "No immediate threats flagged by local rules." : "Potential security concerns flagged during local scan.",
        explanation: `Analysis completed using local rules. VirusTotal engines reported ${vtResult?.maliciousCount ?? 0} malicious detections. AI engine was temporarily unreachable.`,
        indicators: fallbackIndicators,
        recommendations: fallbackRisk === "SAFE"
          ? ["Domain displays standard configuration details. Keep using secure connections."]
          : ["Do not enter credentials or complete transactions on this page.", "Verify the domain suffix aligns with official vendor portals."],
        immediateActions: fallbackRisk === "CRITICAL" ? ["Close this page immediately.", "Run system malware checks if files were downloaded."] : [],
        reasoning: "Generated client-side fallback due to Gemini API timeout or response formatting errors.",
        timestamp: new Date().toISOString()
      };
    }
  }
);
