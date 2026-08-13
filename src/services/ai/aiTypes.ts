export interface AiSecurityResult {
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  summary: string;
  explanation: string;
  indicators: string[];
  recommendations: string[];
  immediateActions: string[];
  reasoning: string;
  timestamp: string;
}

export interface ShieldAssistantResult {
  answer: string;
  indicators: string[];
  recommendations: string[];
  immediateActions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
