
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AppState {
  WELCOME,
  PROCESSING_OCR,
  ANALYZING,
  RESULTS,
  CHATTING,
  ERROR,
}
