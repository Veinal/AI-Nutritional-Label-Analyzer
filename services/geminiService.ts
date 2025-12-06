import { GoogleGenerativeAI, ChatSession as GeminiChat } from "@google/generative-ai";
import { AnalysisResult, ChatSession } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const analysisModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const analysisSchema = {
  type: "object",
  properties: {
    productName: { type: "string", description: "The name of the food product, if available." },
    healthScore: { type: "integer", description: "A health score from 0 (unhealthy) to 100 (very healthy), based on the overall nutritional profile." },
    summary: { type: "string", description: "A brief, one-paragraph summary of the product's healthiness." },
    pros: { type: "array", items: { type: "string" }, description: "A list of 2-4 key positive nutritional aspects." },
    cons: { type: "array", items: { type: "string" }, description: "A list of 2-4 key negative nutritional aspects or concerns." },
    ingredientsAnalysis: {
      type: "array",
      description: "An analysis of key or complex ingredients.",
      items: {
        type: "object",
        properties: {
          ingredient: { type: "string" },
          explanation: { type: "string", description: "A simple explanation of what the ingredient is and its purpose/health effect." },
          isGood: { type: "boolean", description: "True if generally considered healthy or benign, false if it's a concern (e.g., artificial additive, high in sugar/sodium)." }
        },
        required: ["ingredient", "explanation", "isGood"]
      }
    }
  },
  required: ["productName", "healthScore", "summary", "pros", "cons", "ingredientsAnalysis"]
};


export const analyzeNutritionLabel = async (text: string, language: string = 'en'): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the following nutritional label text extracted via OCR. Provide a detailed analysis in JSON format.
    The text may contain errors from OCR, so interpret it intelligently.
    CRITICAL: Provide the 'summary', 'pros', 'cons', and 'ingredientsAnalysis' explanations in the following language: ${language}.
export const analyzeNutritionLabel = async (input: string | { image: string, mimeType: string }): Promise<AnalysisResult> => {
  let promptParts: any[] = [];

  const basePrompt = `
    Analyze the nutritional label provided. Provide a detailed analysis in JSON format.
    The JSON output must conform to this schema: ${JSON.stringify(analysisSchema)}
  `;

  promptParts.push(basePrompt);

  if (typeof input === 'string') {
    // Text-based analysis (fallback or legacy)
    promptParts.push(`
        Nutritional Label Text:
        ---
        ${input}
        ---
      `);
  } else {
    // Image-based analysis
    promptParts.push({
      inlineData: {
        data: input.image,
        mimeType: input.mimeType
      }
    });
  }

  try {
    const result = await analysisModel.generateContent(promptParts);
    const response = result.response;
    const jsonString = response.text();

    const parsedResult = JSON.parse(jsonString);
    return parsedResult as AnalysisResult;
  } catch (error) {
    console.error("Error analyzed nutrition label with Gemini:", error);
    throw new Error("Failed to get a valid analysis from the AI. The label might be unreadable or the content is not a food label.");
  }
};


export const startChatSession = async (contextText: string, language: string = 'en'): Promise<ChatSession> => {
    // Clean up markdown code blocks if present
    const cleanJsonString = jsonString.replace(/```json\n?|\n?```/g, '').trim();

    const parsedResult = JSON.parse(cleanJsonString);
    return parsedResult as AnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing nutrition label with Gemini:", error);
    const errorMessage = error.message || error.toString();
    throw new Error(`AI Analysis Failed: ${errorMessage}`);
  }
};


export const startChatSession = async (contextText: string): Promise<ChatSession> => {
  const systemInstruction = {
    role: "system",
    parts: [{
      text: `
        You are a friendly and knowledgeable nutritional advisor AI. 
        Your goal is to help users understand the food product based on its nutrition label, which has been provided as context.
        Be helpful, clear, and avoid making definitive medical claims.
        Use simple language. Keep responses concise.
        Base your answers strictly on the provided nutritional information.
        CRITICAL: Respond to the user in the following language: ${language}.
        
        Context: The user has just uploaded an image of a food label, and the extracted text is:
        ---
        ${contextText}
        ---
    `}]
  };

  const chat: GeminiChat = chatModel.startChat({
    systemInstruction: systemInstruction,
    history: []
  });

  return {
    async sendMessage(message: string): Promise<string> {
      try {
        const result = await chat.sendMessage(message);
        const response = result.response;
        return response.text();
      } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "I'm sorry, I encountered an error. Please try again.";
      }
    }
  };
};