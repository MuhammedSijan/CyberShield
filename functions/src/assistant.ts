import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { callGeminiAI } from "./utils/gemini";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface AssistantRequest {
  question: string;
  chatHistory: ChatMessage[];
  score: number;
  recentThreats: string[];
}

export const shieldAssistantProxy = onCall<AssistantRequest>(
  {
    region: "us-central1",
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR === "true" ? false : true,
    secrets: ["GEMINI_API_KEY"]
  },
  async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication is required to query the security assistant.");
    }

    // 2. Parameters Sanitization and Validation
    const question = request.data?.question?.trim();
    if (!question || typeof question !== "string" || question.length > 2048) {
      throw new HttpsError("invalid-argument", "A valid question string under 2048 characters is required.");
    }

    const score = Number(request.data?.score ?? 100);
    const recentThreats = Array.isArray(request.data?.recentThreats) ? request.data.recentThreats.slice(0, 5) : [];
    const chatHistory = Array.isArray(request.data?.chatHistory) ? request.data.chatHistory.slice(-10) : []; // Keep last 10 messages max

    logger.info(`shieldAssistantProxy triggered by user ${request.auth.uid}`);

    // 3. Compile context prompt
    const systemInstruction = `You are CyberShield ShieldAI, an expert personal cybersecurity analyst. 
Answer the user's cybersecurity question with professional, technical, yet user-friendly insights. 
You are aware of the user's current CyberShield security status:
- Current safety rating score: ${score}/100
- Recent security warning categories: ${recentThreats.join(", ") || "No recent threats flagged"}

Your responses must be structured JSON matching this exact typescript schema:
{
  "answer": "Your detailed markdown-formatted answer to the user's inquiry. Use bullet points or code snippets if helpful.",
  "indicators": ["relevant cybersecurity concepts or warning markers mentioned"],
  "recommendations": ["top recommendations related to the user's query"],
  "immediateActions": ["immediate mitigation actions if the user is describing an active incident"]
}`;

    // Compile chat history context
    const historyContext = chatHistory
      .map((msg) => `${msg.role === "user" ? "User Query" : "ShieldAI Response"}: ${msg.text}`)
      .join("\n\n");

    const prompt = `${historyContext ? `Conversation History:\n${historyContext}\n\n` : ""}User Current Question: "${question}"

Please resolve the query and provide recommendations according to the schema.`;

    try {
      const aiResponse = await callGeminiAI(prompt, systemInstruction);
      return JSON.parse(aiResponse);
    } catch (err: any) {
      logger.error("AI security assistant query failed. Returning fallback.", err);

      return {
        answer: "I apologize, but I am temporarily unable to connect to the CyberShield Intelligence service. Please check your network connection or try again shortly. For immediate security assistance, you can inspect your system logs or review standard secure practices in the Settings page.",
        indicators: ["API service timeout or connectivity error"],
        recommendations: [
          "Check local system firewall settings.",
          "Verify network proxies or VPNs are configured correctly."
        ],
        immediateActions: []
      };
    }
  }
);
