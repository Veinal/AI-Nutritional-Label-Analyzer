
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "The name of the food product, if available." },
    healthScore: { type: Type.INTEGER, description: "A health score from 0 (unhealthy) to 100 (very healthy), based on the overall nutritional profile." },
    summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the product's healthiness." },
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-4 key positive nutritional aspects." },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-4 key negative nutritional aspects or concerns." },
    ingredientsAnalysis: {
      type: Type.ARRAY,
      description: "An analysis of key or complex ingredients.",
      items: {
        type: Type.OBJECT,
        properties: {
          ingredient: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "A simple explanation of what the ingredient is and its purpose/health effect." },
          isGood: { type: Type.BOOLEAN, description: "True if generally considered healthy or benign, false if it's a concern (e.g., artificial additive, high in sugar/sodium)." }
        },
        required: ["ingredient", "explanation", "isGood"]
      }
    }
  },
  required: ["productName", "healthScore", "summary", "pros", "cons", "ingredientsAnalysis"]
};


export const analyzeNutritionLabel = async (text: string): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the following nutritional label text extracted via OCR. Provide a detailed analysis in JSON format.
    The text may contain errors from OCR, so interpret it intelligently.
    
    Nutritional Label Text:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing nutrition label with Gemini:", error);
    throw new Error("Failed to get a valid analysis from the AI. The label might be unreadable or the content is not a food label.");
  }
};


export const startChatSession = async (contextText: string): Promise<Chat> => {
    const systemInstruction = `
        You are a friendly and knowledgeable nutritional advisor AI. 
        Your goal is to help users understand the food product based on its nutrition label, which has been provided as context.
        Be helpful, clear, and avoid making definitive medical claims.
        Use simple language. Keep responses concise.
        Base your answers strictly on the provided nutritional information.
        
        Context: The user has just uploaded an image of a food label, and the extracted text is:
        ---
        ${contextText}
        ---
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        }
    });

    return chat;
};
