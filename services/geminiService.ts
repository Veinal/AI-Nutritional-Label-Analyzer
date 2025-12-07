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
    },
    sugarContent: {
      type: "object",
      properties: {
        grams: { type: "number", description: "Total sugar content in grams per serving (or per container if more appropriate)." },
        cubes: { type: "number", description: "Total sugar content converted to sugar cubes (1 cube = 4g). Round to 1 decimal place." }
      },
      required: ["grams", "cubes"]
    },
    healthScoreExplanation: { type: "string", description: "A concise explanation (1-2 sentences) of why the product received this specific health score." },
    recommendations: {
      type: "array",
      description: "List of 1-3 healthier alternative products.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the alternative product." },
          score: { type: "integer", description: "Estimated health score of the alternative (0-100)." },
          reason: { type: "string", description: "Why is this a better choice?" }
        },
        required: ["name", "score", "reason"]
      }
    }
  },
  required: ["productName", "healthScore", "summary", "pros", "cons", "ingredientsAnalysis", "sugarContent", "healthScoreExplanation", "recommendations"]
};


export const analyzeNutritionLabel = async (input: string | { image: string, mimeType: string }, language: string = 'en'): Promise<AnalysisResult> => {
  let promptParts: any[] = [];

  const basePrompt = `
    Analyze the nutritional label provided. Provide a detailed analysis in JSON format.
    The JSON output must conform to this schema: ${JSON.stringify(analysisSchema)}
    CRITICAL: The output JSON values (summary, pros, cons, explanations, reasons) MUST be written in natural, fluent ${language}. Ensure the tone is helpful and accessible.
    For sugar calculation: 1 sugar cube = 4g of sugar. If grams are not explicitly listed, estimate based on ingredients or standard values for this product type.
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


export const startChatSession = async (contextText: string, language: string = 'en'): Promise<ChatSession> => {
  const systemInstruction = {
    role: "system",
    parts: [{
      text: `
        You are a friendly and knowledgeable nutritional advisor AI. 
        Your goal is to help users understand the food product based on its nutrition label, which has been provided as context.
        Be helpful, clear, and avoid making definitive medical claims.
        Use simple language. Keep responses concise.
        Base your answers strictly on the provided nutritional information.
        CRITICAL: You must converse with the user in ${language}. Ensure your responses are natural, fluent, and culturally appropriate for a native speaker of this language. Do not just translate; think and respond in ${language}.
        
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