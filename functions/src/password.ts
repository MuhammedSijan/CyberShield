import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { callGeminiAI } from "./utils/gemini";

interface PasswordRequest {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  score: number;
  strength: string;
  noRepeats: boolean;
  noCommonWords: boolean;
}

export const explainPasswordProxy = onCall<PasswordRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to run password health audits.");
    }

    // 2. Parameters Sanitization and Validation
    const length = Number(request.data?.length || 0);
    const hasUppercase = Boolean(request.data?.hasUppercase);
    const hasLowercase = Boolean(request.data?.hasLowercase);
    const hasNumbers = Boolean(request.data?.hasNumbers);
    const hasSymbols = Boolean(request.data?.hasSymbols);
    const score = Number(request.data?.score || 0);
    const strength = String(request.data?.strength || "Weak");
    const noRepeats = Boolean(request.data?.noRepeats);
    const noCommonWords = Boolean(request.data?.noCommonWords);

    if (length <= 0 || length > 500) {
      throw new HttpsError("invalid-argument", "Invalid password length parameter.");
    }

    logger.info(`explainPasswordProxy triggered by user ${request.auth.uid} with length ${length}`);

    // 3. Call Gemini AI
    const systemInstruction = `You are CyberShield ShieldAI, an expert identity security and cryptography advisor. 
Analyze the provided password metadata (never request or parse raw password text) and explain the vulnerability. 
Detail why short passwords can be brute-forced in seconds and why repeating patterns make passwords weak. 
Detail the danger of using common words and why password reuse represents a severe identity threat. 
Advise on using secure passphrases (e.g. four random dictionary words) or secure password managers. 
Return a structured JSON response matching this schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief explanation of password posture",
  "explanation": "Detail of findings showing entropy issues or pattern dangers",
  "indicators": ["vulnerabilities detected e.g. short length, missing special characters, dictionary words found"],
  "recommendations": ["actions the user should perform to secure their accounts"],
  "immediateActions": ["immediate mitigation steps"],
  "reasoning": "Internal logical analysis steps",
  "timestamp": "ISO timestamp string"
}`;

    const prompt = `Password Complexity Profile:
- Character Length: ${length}
- Contains Uppercase (A-Z): ${hasUppercase ? "Yes" : "No"}
- Contains Lowercase (a-z): ${hasLowercase ? "Yes" : "No"}
- Contains Numbers (0-9): ${hasNumbers ? "Yes" : "No"}
- Contains Symbols (!@#$): ${hasSymbols ? "Yes" : "No"}
- Complexity Score: ${score}/100
- Strength Level: ${strength}
- No Repeated Patterns: ${noRepeats ? "Yes" : "No"}
- No Common Words: ${noCommonWords ? "Yes" : "No"}

Please generate a structured risk assessment report based on these parameters. Do NOT request the raw password text.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      return JSON.parse(aiResponse);
    } catch (err: any) {
      logger.error("AI Password checker explanation failed. Returning local fallback.", err);

      const fallbackLevel = score >= 80 ? "SAFE" : score >= 50 ? "MEDIUM" : "CRITICAL";
      const fallbackIndicators: string[] = [];
      if (length < 12) fallbackIndicators.push("Short length (under 12 characters)");
      if (!hasUppercase || !hasLowercase) fallbackIndicators.push("Lack of mixed casing");
      if (!hasNumbers) fallbackIndicators.push("No numeric digits included");
      if (!hasSymbols) fallbackIndicators.push("No special characters or symbols included");
      if (!noRepeats) fallbackIndicators.push("Contains repeating character groups");
      if (!noCommonWords) fallbackIndicators.push("Contains common dictionary patterns");

      return {
        riskLevel: fallbackLevel,
        confidence: 90,
        summary: fallbackLevel === "SAFE" ? "Passphrase shows solid entropy characteristics." : "Vulnerabilities detected in password complexity profile.",
        explanation: `Password strength is rated ${strength}. It satisfies ${[length >= 12, hasUppercase, hasLowercase, hasNumbers, hasSymbols, noRepeats, noCommonWords].filter(Boolean).length} out of 7 complexity parameters. AI generator was temporarily offline.`,
        indicators: fallbackIndicators,
        recommendations: [
          "Use a secure password manager to generate and store high-entropy strings.",
          "Ensure unique passwords are configured for all individual accounts."
        ],
        immediateActions: fallbackLevel === "CRITICAL" ? ["Change this password immediately across all services where it is configured."] : [],
        reasoning: "Generated server-side fallback due to AI model query exception.",
        timestamp: new Date().toISOString()
      };
    }
  }
);
