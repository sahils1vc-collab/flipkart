
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const getAiClient = () => {
    // In a real client-side app, storing API keys in code is unsafe. 
    // This expects the key to be injected via environment variables or a proxy.
    const apiKey = process.env.API_KEY; 
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

// Local Fallback Generator (Simulates AI when API is unavailable)
const generateOfflineDescription = (productName: string, category: string): string => {
    const templates = [
        `Discover the premium quality of ${productName}. Designed for the modern lifestyle, this item from our ${category} collection offers exceptional durability and style.`,
        `Upgrade your ${category} experience with the ${productName}. Built with high-grade materials, it ensures long-lasting performance and value.`,
        `The ${productName} is a top-rated choice in ${category}. Featuring a sleek design and user-friendly interface, it's perfect for daily use.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
    const ai = getAiClient();
    
    // If no API key or client-side restriction, return offline generation immediately
    if (!ai) {
        console.log("Running in Client-Side Mode: Generating offline description.");
        return generateOfflineDescription(productName, category);
    }

    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Write a short, catchy, and professional e-commerce product description (max 50 words) for a product named "${productName}" in the category "${category}". Do not use markdown formatting.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || generateOfflineDescription(productName, category);
    } catch (error) {
        console.warn("AI Generation Failed (likely CORS or Quota). Using Offline Fallback.");
        return generateOfflineDescription(productName, category);
    }
};
