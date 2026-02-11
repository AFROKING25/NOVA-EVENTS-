
import { GoogleGenAI } from "@google/genai";

export type TemplateType = 'REMINDER' | 'THANK_YOU' | 'INVITATION';

export const generateTemplate = async (
  guestName: string,
  eventName: string,
  status: string,
  type: TemplateType
): Promise<string> => {
  try {
    // Initialize GoogleGenAI with apiKey from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as a professional event communication assistant. 
      Generate a warm, professional, and culturally appropriate message for a guest in Tanzania.
      Guest Name: ${guestName}
      Event Name: ${eventName}
      Current Status: ${status}
      Template Type: ${type}
      
      Language: Swahili mixed with polite English (Sheng/Urban Tanzanian style).
      The tone should be respectful yet modern.
      Keep it under 160 characters if possible for SMS compatibility.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // Access the text property directly on the response object
    return response.text || "Template generation failed. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating template. Please check your connection.";
  }
};

export interface MapSearchResult {
  name: string;
  address: string;
  url: string;
}

export const searchLocations = async (query: string): Promise<MapSearchResult[]> => {
  if (!query || query.length < 3) return [];

  try {
    // Initialize GoogleGenAI with apiKey from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Get current position if possible to bias results
    let latLng = undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      latLng = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };
    } catch (e) {
      console.warn("Geolocation failed, searching without bias", e);
    }

    // Google Maps grounding is specifically supported in Gemini 2.5 series models.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find and list 5 real places in Tanzania matching the query: "${query}". Provide their exact names and specific locations.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: latLng
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract maps data from grounding chunks
    const results: MapSearchResult[] = chunks
      .filter(chunk => chunk.maps)
      .map(chunk => ({
        name: chunk.maps.title || "Unknown Venue",
        address: "Tanzania", // The title usually contains enough info, or we could parse the text
        url: chunk.maps.uri || ""
      }))
      .filter(res => res.url);

    // Fallback if chunks are empty but text has content
    if (results.length === 0 && response.text) {
        // If we only get text, we try to extract common place patterns or just return one result based on text
        // But usually grounding chunks are reliable for Maps tool.
        console.log("No grounding chunks found, but received text:", response.text);
    }

    return results;
  } catch (error) {
    console.error("Location Search Error:", error);
    return [];
  }
};
