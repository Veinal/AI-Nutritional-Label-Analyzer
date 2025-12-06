import * as gemini from './geminiService';
import * as openai from './openAIService';
import { AnalysisResult } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const isGeminiAvailable = () => GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here";
const isOpenAIAvailable = () => OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";

interface ChatSession {
    sendMessage(message: string): Promise<string>;
}

export const analyzeNutritionLabel = async (text: string, language: string = 'en'): Promise<AnalysisResult> => {
    if (isGeminiAvailable()) {
        return gemini.analyzeNutritionLabel(text, language);
    }
    if (isOpenAIAvailable()) {
        return openai.analyzeNutritionLabel(text, language);
    }
    throw new Error("No AI provider API key configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env.local file.");
};

export const startChatSession = async (contextText: string, language: string = 'en'): Promise<ChatSession> => {
    if (isGeminiAvailable()) {
        const geminiChat = await gemini.startChatSession(contextText, language);
        return {
            sendMessage: (message: string) => geminiChat.sendMessage(message)
        };
    }
    if (isOpenAIAvailable()) {
        return openai.startChatSession(contextText, language);
    }
    throw new Error("No AI provider API key configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env.local file.");
};

export const getAvailableServiceProvider = (): 'Gemini' | 'OpenAI' | 'None' => {
    if (isGeminiAvailable()) return 'Gemini';
    if (isOpenAIAvailable()) return 'OpenAI';
    return 'None';
}
