import OpenAI from "openai";
import { AnalysisResult } from '../types';

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

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
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        
        const jsonString = response.choices[0].message.content;
        if (!jsonString) {
            throw new Error("OpenAI returned an empty response.");
        }
        const result = JSON.parse(jsonString);
        return result as AnalysisResult;
    } catch (error) {
        console.error("Error analyzing nutrition label with OpenAI:", error);
        throw new Error("Failed to get a valid analysis from the AI. The label might be unreadable or the content is not a food label.");
    }
};

class OpenAIChat {
    private context: string;
    private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    constructor(contextText: string) {
        this.context = contextText;
        this.messages.push({
            role: "system",
            content: `
                You are a friendly and knowledgeable nutritional advisor AI. 
                Your goal is to help users understand the food product based on its nutrition label, which has been provided as context.
                Be helpful, clear, and avoid making definitive medical claims.
                Use simple language. Keep responses concise.
                Base your answers strictly on the provided nutritional information.
                
                Context: The user has just uploaded an image of a food label, and the extracted text is:
                ---
                ${this.context}
                ---
            `
        });
    }

    async sendMessage(message: string): Promise<string> {
        this.messages.push({ role: "user", content: message });

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: this.messages,
            });

            const responseMessage = response.choices[0].message.content;
            if (!responseMessage) {
                return "I'm sorry, I couldn't generate a response.";
            }
            this.messages.push({ role: "assistant", content: responseMessage });
            return responseMessage;
        } catch (error) {
            console.error("Error sending message to OpenAI:", error);
            return "I'm sorry, I encountered an error. Please try again.";
        }
    }
}

export const startChatSession = async (contextText: string) => {
    return new OpenAIChat(contextText);
};
