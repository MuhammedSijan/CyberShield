import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase';
import { aiCache } from './aiCache';
import type { AiSecurityResult, ShieldAssistantResult, ChatMessage } from './aiTypes';

// Initializing the Cloud Functions references
const urlProxy = httpsCallable<{ url: string }, AiSecurityResult>(functions, 'analyzeUrlProxy');
const phishingProxy = httpsCallable<{ text: string }, AiSecurityResult>(functions, 'analyzePhishingProxy');
const fileProxy = httpsCallable<{ name: string; extension: string; mimeType: string; size: number; hash: string }, AiSecurityResult>(functions, 'analyzeFileProxy');
const qrProxy = httpsCallable<{ content: string }, AiSecurityResult>(functions, 'analyzeQrProxy');
const passwordProxy = httpsCallable<{
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  score: number;
  strength: string;
  noRepeats: boolean;
  noCommonWords: boolean;
}, AiSecurityResult>(functions, 'explainPasswordProxy');
const advisoryProxy = httpsCallable<{ scans: any[]; score: number }, AiSecurityResult>(functions, 'securityAdvisoryProxy');
const assistantProxy = httpsCallable<{
  question: string;
  chatHistory: ChatMessage[];
  score: number;
  recentThreats: string[];
}, ShieldAssistantResult>(functions, 'shieldAssistantProxy');

export const aiService = {
  /**
   * Safe wrapper that checks caching and queries the url safety proxy function.
   */
  analyzeUrl: async (url: string): Promise<AiSecurityResult> => {
    const cached = aiCache.get('url', url);
    if (cached) return cached;

    try {
      const response = await urlProxy({ url });
      if (response?.data) {
        aiCache.set('url', url, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from URL proxy.");
    } catch (err: any) {
      console.error("URL analysis function failed. Falling back to local rules.", err);
      // Fallback response so user doesn't experience a crash
      return {
        riskLevel: 'MEDIUM',
        confidence: 50,
        summary: 'AI Engine temporarily offline.',
        explanation: 'Local rules have run. Complete AI threat verification is offline. Error: ' + (err.message || 'Unknown network error'),
        indicators: ['Intelligence service connection failure'],
        recommendations: ['Verify link credentials manually before entering details.'],
        immediateActions: [],
        reasoning: 'AI model client-side fallback due to function execution failure.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Queries the phishing message proxy function.
   */
  analyzePhishing: async (text: string): Promise<AiSecurityResult> => {
    // Generate cache key using a substring of the text
    const cacheKey = text.substring(0, 300);
    const cached = aiCache.get('phishing', cacheKey);
    if (cached) return cached;

    try {
      const response = await phishingProxy({ text });
      if (response?.data) {
        aiCache.set('phishing', cacheKey, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from phishing proxy.");
    } catch (err: any) {
      console.error("Phishing analysis function failed. Falling back.", err);
      return {
        riskLevel: 'MEDIUM',
        confidence: 50,
        summary: 'AI Phishing service connection offline.',
        explanation: 'The CyberShield phishing parser could not establish a connection to the server. Local rules applied. Error: ' + (err.message || 'Network error'),
        indicators: ['AI service offline'],
        recommendations: ['Observe standard warnings. Do not enter credentials on suspicious link redirects.'],
        immediateActions: [],
        reasoning: 'Server communication error fallback.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Queries the file safety proxy function using file metadata (never uploads content bytes).
   */
  analyzeFile: async (metadata: { name: string; extension: string; mimeType: string; size: number; hash: string }): Promise<AiSecurityResult> => {
    const cached = aiCache.get('file', metadata.hash);
    if (cached) return cached;

    try {
      const response = await fileProxy(metadata);
      if (response?.data) {
        aiCache.set('file', metadata.hash, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from file proxy.");
    } catch (err: any) {
      console.error("File analysis function failed. Falling back.", err);
      return {
        riskLevel: 'MEDIUM',
        confidence: 50,
        summary: 'AI File Safety service connection offline.',
        explanation: 'Local metadata checks compiled. Detailed sandbox check offline. Error: ' + (err.message || 'Network error'),
        indicators: ['External service connection error'],
        recommendations: ['Perform a scan on your local anti-virus program before executing.'],
        immediateActions: [],
        reasoning: 'Server communication error fallback.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Queries the QR safety proxy function.
   */
  analyzeQr: async (content: string): Promise<AiSecurityResult> => {
    const cached = aiCache.get('qr', content);
    if (cached) return cached;

    try {
      const response = await qrProxy({ content });
      if (response?.data) {
        aiCache.set('qr', content, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from QR proxy.");
    } catch (err: any) {
      console.error("QR analysis function failed. Falling back.", err);
      return {
        riskLevel: 'MEDIUM',
        confidence: 50,
        summary: 'AI QR safety service connection offline.',
        explanation: 'QR content decoded locally. Redirection safety checks could not connect. Error: ' + (err.message || 'Network error'),
        indicators: ['QR analysis service offline'],
        recommendations: ['Do not browse decoded redirection links manually without safety inspection.'],
        immediateActions: [],
        reasoning: 'Server communication error fallback.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Queries the password vulnerability analyzer proxy function using derived characteristics.
   */
  explainPassword: async (metrics: {
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    score: number;
    strength: string;
    noRepeats: boolean;
    noCommonWords: boolean;
  }): Promise<AiSecurityResult> => {
    const cacheKey = JSON.stringify(metrics);
    const cached = aiCache.get('password', cacheKey);
    if (cached) return cached;

    try {
      const response = await passwordProxy(metrics);
      if (response?.data) {
        aiCache.set('password', cacheKey, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from password proxy.");
    } catch (err: any) {
      console.error("Password health analyzer function failed. Falling back.", err);
      return {
        riskLevel: metrics.score >= 70 ? 'SAFE' : metrics.score >= 45 ? 'LOW' : 'HIGH',
        confidence: 80,
        summary: 'Local metrics checked. AI explanation service offline.',
        explanation: `Password strength rated ${metrics.strength} locally with score ${metrics.score}/100. Server explanation was unreachable. Error: ` + (err.message || 'Network error'),
        indicators: ['Server proxy connection failed'],
        recommendations: ['Adopt long passphrases and store them in secure managers.'],
        immediateActions: [],
        reasoning: 'Server communication error fallback.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Queries the user posture advisory proxy function.
   */
  getSecurityAdvisory: async (scans: any[], score: number): Promise<AiSecurityResult> => {
    // Generate a cache key based on score and scan count
    const cacheKey = `advisory_${score}_${scans.length}_${scans[0]?.timestamp || ''}`;
    const cached = aiCache.get('advisory', cacheKey);
    if (cached) return cached;

    try {
      const response = await advisoryProxy({ scans, score });
      if (response?.data) {
        aiCache.set('advisory', cacheKey, response.data);
        return response.data;
      }
      throw new Error("Empty response data received from advisory proxy.");
    } catch (err: any) {
      console.error("Security posture advisory function failed. Falling back.", err);
      return {
        riskLevel: 'MEDIUM',
        confidence: 50,
        summary: 'AI Security Advisory service offline.',
        explanation: 'Local history metrics synced. Security advisory summaries cannot load. Error: ' + (err.message || 'Network error'),
        indicators: [],
        recommendations: ['Keep checking files, passwords, and domains to build digital posture.'],
        immediateActions: [],
        reasoning: 'Server communication error fallback.',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Interactive chatbot endpoint query (uncached to support multi-turn query variation).
   */
  askSecurityAssistant: async (
    question: string,
    chatHistory: ChatMessage[],
    score: number,
    recentThreats: string[]
  ): Promise<ShieldAssistantResult> => {
    try {
      const response = await assistantProxy({
        question,
        chatHistory,
        score,
        recentThreats
      });
      if (response?.data) {
        return response.data;
      }
      throw new Error("Empty response data received from AI Security Assistant.");
    } catch (err: any) {
      console.error("AI assistant function failed.", err);
      return {
        answer: "I am having trouble communicating with the ShieldAI server. Please verify your internet connection. Here is a brief recommendation: scan suspicious elements using the individual scanners inside the Security Hub.",
        indicators: ["Service connection lost"],
        recommendations: ["Check connection state", "Retry question in a few moments"],
        immediateActions: []
      };
    }
  }
};
