"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAdvisoryProxy = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const gemini_1 = require("./utils/gemini");
exports.securityAdvisoryProxy = (0, https_1.onCall)({
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY"]
}, async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required to view security briefings.");
    }
    // 2. Parameters Sanitization and Validation
    const score = Number(request.data?.score ?? 100);
    const rawScans = request.data?.scans || [];
    if (score < 0 || score > 100) {
        throw new https_1.HttpsError("invalid-argument", "Security score must be a number between 0 and 100.");
    }
    if (!Array.isArray(rawScans)) {
        throw new https_1.HttpsError("invalid-argument", "Scans parameter must be an array.");
    }
    // Limit array to prevent excessive prompt lengths (e.g. max 15 recent scans)
    const scansList = rawScans.slice(0, 15).map((s) => ({
        type: String(s.type || "unknown"),
        target: String(s.target || "N/A").substring(0, 128),
        result: String(s.result || "N/A").substring(0, 128),
        riskScore: Number(s.riskScore ?? 0),
        riskLevel: String(s.riskLevel || "Safe")
    }));
    firebase_functions_1.logger.info(`securityAdvisoryProxy triggered by user ${request.auth.uid} with ${scansList.length} scans`);
    if (scansList.length === 0) {
        // Empty state
        return {
            riskLevel: "SAFE",
            confidence: 100,
            summary: "No diagnostic scans recorded yet.",
            explanation: "Run password, file, or domain diagnostics in the Security Hub to compile your personal security briefing.",
            indicators: [],
            recommendations: ["Select a diagnostic tool to run your first check.", "Challenge your security habits in the Hygiene Quiz."],
            immediateActions: [],
            reasoning: "No user scan history available to generate advisory logs.",
            timestamp: new Date().toISOString()
        };
    }
    // 3. Telemetry Compilation
    const dangerScans = scansList.filter((s) => s.riskLevel === "Danger" || s.riskLevel === "Danger / Threat Blocked" || s.riskLevel === "Critical Danger");
    const suspiciousScans = scansList.filter((s) => s.riskLevel === "Suspicious" || s.riskLevel === "Suspicious / Risk Flag" || s.riskLevel === "Caution / Suspicious Domain");
    const safeScans = scansList.filter((s) => s.riskLevel === "Safe");
    // 4. Call Gemini AI
    const systemInstruction = `You are CyberShield ShieldAI, a chief security posture advisor. 
Analyze the user's digital exposure telemetry and security score to generate a personalized security brief.
Outline:
1. What is going well (based on safe scans and quizzes).
2. What requires attention (based on suspicious or dangerous scans).
3. The biggest current weakness.
4. Top 3 recommended actions.
Be professional, structured, and helpful. Never fabricate or duplicate scan logs.
Return a structured JSON response matching this schema:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number (0 to 100),
  "summary": "Brief security posture overview summary",
  "explanation": "Personalized assessment of user security posture, highlighting strengths and vulnerabilities",
  "indicators": ["biggest current weaknesses identified"],
  "recommendations": ["top 3 recommendations for the user"],
  "immediateActions": ["immediate hazard control commands"],
  "reasoning": "Internal logical analysis steps",
  "timestamp": "ISO timestamp string"
}`;
    const prompt = `User Security Posture Telemetry:
- Safety Score: ${score}/100
- Total Scans Analyzed: ${scansList.length}
- Safe Scans: ${safeScans.length}
- Suspicious Scans: ${suspiciousScans.length}
- Dangerous Scans: ${dangerScans.length}

Recent scan details:
${scansList.map((s, idx) => `${idx + 1}. [${s.type.toUpperCase()}] Target: ${s.target} | Result: ${s.result} | Level: ${s.riskLevel}`).join("\n")}

Please review this history and generate the personalized advisory report in structured JSON format.`;
    try {
        const aiResponse = await (0, gemini_1.callGeminiAI)(prompt, systemInstruction);
        return JSON.parse(aiResponse);
    }
    catch (err) {
        firebase_functions_1.logger.error("AI Posture advisory generation failed. Returning fallback.", err);
        const fallbackLevel = score >= 90 ? "SAFE" : score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";
        return {
            riskLevel: fallbackLevel,
            confidence: 85,
            summary: fallbackLevel === "SAFE" ? "Security posture is currently GOOD." : "Attention required: security weaknesses detected.",
            explanation: `Analyzed security score of ${score}%. Local records show ${dangerScans.length} dangerous threat blocks and ${suspiciousScans.length} suspicious inputs out of ${scansList.length} total checks. AI advisor was unavailable.`,
            indicators: dangerScans.map((d) => `Danger scan in ${d.type}: ${d.target}`).concat(suspiciousScans.map((s) => `Suspicious scan in ${s.type}: ${s.target}`)),
            recommendations: [
                "Continue checking links and messages before clicking them.",
                "Run the passwordchecker on your primary credentials.",
                "Perform quizzes regularly to build security hygiene habits."
            ],
            immediateActions: dangerScans.length > 0 ? ["Verify accounts associated with flagged threat scans."] : [],
            reasoning: "Generated server-side fallback due to Gemini API communication timeout.",
            timestamp: new Date().toISOString()
        };
    }
});
//# sourceMappingURL=advisory.js.map