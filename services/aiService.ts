import * as gemini from './geminiService';
import { AnalysisResult } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const isGeminiAvailable = () => GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here";

interface ChatSession {
    sendMessage(message: string): Promise<string>;
}

export const analyzeNutritionLabel = async (input: string | { image: string, mimeType: string }, language: string = 'en'): Promise<AnalysisResult> => {
    if (isGeminiAvailable()) {
        return gemini.analyzeNutritionLabel(input, language);
    }
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.");
};

export const startChatSession = async (contextText: string, language: string = 'en'): Promise<ChatSession> => {
    if (isGeminiAvailable()) {
        const geminiChat = await gemini.startChatSession(contextText, language);
        return {
            sendMessage: (message: string) => geminiChat.sendMessage(message)
        };
    }
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.");
};

export const getAvailableServiceProvider = (): 'Gemini' | 'OpenAI' | 'None' => {
    if (isGeminiAvailable()) return 'Gemini';
    return 'None';
}
