import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

app.get('/api/get-live-token', async (req, res) => {
    try {
        // Create a token valid for 10 minutes, specifically for the Live API
        const response = await client.authTokens.create({
            config: {
                expiration: "600s",
                allowedScopes: ["generative-language.googleapis.com/gemini-live"]
            }
        });
        res.json({ token: response.token });
    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ error: error.message || "Failed to generate token" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
