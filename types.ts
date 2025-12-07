
export interface AnalysisResult {
  productName: string;
  healthScore: number;
  summary: string;
  pros: string[];
  cons: string[];
  ingredientsAnalysis: Array<{
    ingredient: string;
    explanation: string;
    isGood: boolean;
  }>;
  sugarContent: {
    grams: number;
    cubes: number;
  };
  healthScoreExplanation: string;
  recommendations: Array<{
    name: string;
    score: number;
    reason: string;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  sendMessage(message: string): Promise<string>;
}

export enum AppState {
  WELCOME,
  CAMERA,
  PROCESSING_OCR,
  ANALYZING,
  RESULTS,
  CHATTING,
  LIVE_MODE,
  ERROR,
}
