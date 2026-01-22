
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { RiskAlert } from "../types";

// Initialize the API key from environment variables defined in vite.config.ts
// We use a fallback empty string to prevent immediate crashes if the key is missing,
// although the functionality will be limited.
const API_KEY = process.env.API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeTokenRisk = async (tokenName: string, symbol: string): Promise<RiskAlert[]> => {
  // Fail gracefully if no API key is present
  if (!API_KEY || API_KEY.includes("YOUR_API_KEY")) {
    console.warn("Gemini API Key is missing or invalid");
    return [];
  }

  try {
    // Use gemini-1.5-flash for speed and JSON capabilities
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING, format: 'enum', enum: ['SCAM', 'HIGH_VOLATILITY', 'CONTRACT_RISK', 'LOW_LIQUIDITY'] },
              severity: { type: SchemaType.STRING, format: 'enum', enum: ['CRITICAL', 'WARNING', 'INFO'] },
              description: { type: SchemaType.STRING },
              tokenName: { type: SchemaType.STRING }
            },
            required: ["type", "severity", "description", "tokenName"]
          }
        }
      }
    });

    const prompt = `Perform a safety and risk audit for the cryptocurrency token: ${tokenName} (${symbol}). Identify potential rug pulls, scam patterns, or high volatility risks based on historical data up to your knowledge cutoff. Return results in JSON format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const results = JSON.parse(text || "[]");
    return results.map((r: any, idx: number) => ({
      ...r,
      id: `ai-${idx}-${Date.now()}`,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return [];
  }
};

/**
 * Generates high-impact notification content for Email or SMS based on a risk alert.
 */
export const generateAlertMessage = async (alert: RiskAlert, channel: 'SMS' | 'EMAIL'): Promise<string> => {
  if (!API_KEY) return "Security Alert: Urgent action required.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = channel === 'SMS'
      ? `Write a very short (max 160 chars) urgent SMS alert for a crypto user about this risk: ${alert.description} for ${alert.tokenName}.`
      : `Write a professional but urgent email body for a crypto security alert. Context: ${alert.description} for token ${alert.tokenName}. Include a clear 'Call to Action' for the user to review their holdings.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Security Alert: Urgent action required on your portfolio.";
  } catch (error) {
    console.error("Alert generation failed:", error);
    return "Portfolio Security Alert: Unusual activity detected. Please login to Crypto Tracker.";
  }
};
