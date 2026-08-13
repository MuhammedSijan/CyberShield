import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { callGeminiAI } from "./utils/gemini";

interface PhishingRequest {
  text: string;
}

export const analyzePhishingProxy = onCall<PhishingRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to analyze phishing patterns.");
    }

    // 2. Input Sanitization & Validation
    const rawText = request.data?.text;
    if (!rawText || typeof rawText !== "string") {
      throw new HttpsError("invalid-argument", "A valid message text is required.");
    }

    const cleanText = rawText.trim().substring(0, 10000); // Sensible limit to prevent payload abuse
    if (cleanText.length === 0) {
      throw new HttpsError("invalid-argument", "Message content cannot be empty.");
    }

    logger.info(`analyzePhishingProxy execution triggered by user ${request.auth.uid}`);

    // 3. Local Deterministic Rule Checks (Telemetry)
    const lowerText = cleanText.toLowerCase();
    const localIndicators: string[] = [];
    let baseScore = 10;

    if (lowerText.includes("http://") || lowerText.includes("https://")) {
      baseScore += 30;
      localIndicators.push("Contains external hyperlinks");
    }
    if (
      lowerText.includes("urgent") ||
      lowerText.includes("immediate") ||
      lowerText.includes("freeze") ||
      lowerText.includes("suspend") ||
      lowerText.includes("lock")
    ) {
      baseScore += 25;
      localIndicators.push("Urgent threat language or fear tactics");
    }
    if (
      lowerText.includes("win") ||
      lowerText.includes("congratulations") ||
      lowerText.includes("prize") ||
      lowerText.includes("lottery") ||
      lowerText.includes("lucky")
    ) {
      baseScore += 20;
      localIndicators.push("Greed incentive (lottery, prizes, or cash rewards)");
    }

    // 4. Call Gemini AI
    const systemInstruction = `You are CyberShield ShieldAI, an expert social engineering analyst. 
Analyze the provided email, SMS, or chat text for phishing markers. 
Determine if it is safe, suspicious, or dangerous. 
Identify manipulation tactics such as urgency, fear, impersonation, credential harvesting, or fake rewards.
Return a structured JSON response matching this typescript schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief threat state title",
  "explanation": "Detailed explanation of which tactics were detected and why it is suspicious",
  "indicators": ["specific flags e.g. urgent action demands, non-matching link domains"],
  "recommendations": ["what the user should do"],
  "immediateActions": ["immediate steps e.g. block sender, delete SMS"],
  "reasoning": "Internal logical analysis steps",
  "timestamp": "ISO timestamp string"
}`;

    const prompt = `Phishing Analysis Input:
- Message Payload: "${cleanText}"
- Deterministic Indicators Triggered: ${localIndicators.join(", ") || "None"}
- Initial Risk Indicator: ${baseScore}/100

Please analyze this content and return the structured JSON report.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      return JSON.parse(aiResponse);
    } catch (err: any) {
      logger.error("AI Phishing analysis failed or returned invalid JSON. Falling back to rules.", err);

      const fallbackLevel = baseScore >= 60 ? "HIGH" : baseScore >= 35 ? "MEDIUM" : "SAFE";

      return {
        riskLevel: fallbackLevel,
        confidence: 70,
        summary: fallbackLevel === "SAFE" ? "No standard automated indicators detected." : "Suspicious communication patterns identified.",
        explanation: `Parsed message via local rule engine. Found ${localIndicators.length} suspicious linguistic signature(s). AI engine was temporarily offline.`,
        indicators: localIndicators.length > 0 ? localIndicators : ["No automatic flags, review sender address manually."],
        recommendations: [
          "Do not share personal details, bank numbers, or login credentials.",
          "Check communication history directly on the service's official website."
        ],
        immediateActions: fallbackLevel === "HIGH" ? ["Delete the message and block the sender.", "Do not click any embedded links."] : [],
        reasoning: "Generated server-side fallback due to AI model timeout or parser exception.",
        timestamp: new Date().toISOString()
      };
    }
  }
);
