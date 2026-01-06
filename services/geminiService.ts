
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { User, UserRole } from "../types";

// Helper to get Gemini client using process.env.API_KEY directly as required by guidelines.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getHealthTip = async (userRole: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Provide a short, inspiring, single-sentence health tip or fact specifically for a blood bank system user who is a ${userRole}. 
    If they are a donor, motivate them. If they are a recipient, give hope. If admin, give a management tip.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Health is wealth. Take care of yourself.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Donate blood, save lives. Every drop counts.";
  }
};

export const chatWithSamrat = async (message: string, context: string, useThinking: boolean = false): Promise<string> => {
  const ai = getAiClient();

  try {
    const model = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const systemInstruction = `You are Samrat, a friendly, intelligent, and 24/7 AI assistant for the BloodBank System. 
    Your goal is to help Admins, Donors, and Recipients with their queries about blood donation, health, or navigating the system.
    
    Current User Context: ${context}
    
    Keep answers concise, professional, and helpful. 
    If asked about medical advice, strictly advise consulting a doctor. 
    Use a warm, encouraging tone.`;

    const config: any = {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }]
    };

    if (useThinking) {
      // Thinking config is only available for Gemini 3 and 2.5 series.
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: config
    });

    let text = response.text || "I didn't quite catch that. Could you rephrase?";
    
    // Extract and append grounding links if available as per guidelines.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const links = chunks
        .map((chunk: any) => chunk.web?.uri || chunk.maps?.uri)
        .filter(Boolean);
      if (links.length > 0) {
        const uniqueLinks = Array.from(new Set(links));
        text += "\n\nSources:\n" + uniqueLinks.map(link => `- ${link}`).join("\n");
      }
    }

    return text;
  } catch (error) {
    console.error("Samrat Error:", error);
    return "My systems are having a moment. Please try again later.";
  }
};

export const analyzeMedicalImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();

  try {
    // Multi-part content for image analysis using high-quality reasoning model.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this medical certificate or document for a blood bank system. Extract the blood type, date of donation, and hospital name if visible. Mention if it looks like a valid donor certificate."
          }
        ]
      }
    });
    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Failed to process image.";
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: 'audio/wav'
            }
          },
          {
            text: "Transcribe the following audio precisely."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Failed to transcribe audio.";
  }
};

export const findHospitalsNearby = async (city: string, lat?: number, lng?: number): Promise<string> => {
  const ai = getAiClient();

  try {
    // Maps grounding is only supported in Gemini 2.5 series models.
    const config: any = {
      tools: [{ googleMaps: {} }, { googleSearch: {} }]
    };

    if (lat && lng) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the best blood banks or hospitals for blood donation in or near ${city}. Provide names, addresses, and any available links.`,
      config: config
    });

    let text = response.text || "No results found.";
    
    // Extract grounding URLs and list them as links per guidelines.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
       const links = chunks.map((c: any) => c.maps?.uri || c.web?.uri).filter(Boolean);
       if (links.length > 0) {
         text += "\n\nVerified Sources:\n" + Array.from(new Set(links)).map(l => `- ${l}`).join("\n");
       }
    }

    return text;
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return "Search failed.";
  }
};

export const findDonorsWithAI = async (bloodType: string, city: string): Promise<User[]> => {
  const ai = getAiClient();
  
  const generateFallback = () => {
     const bType = bloodType === 'All' ? ['O+', 'A+', 'B-', 'AB+'][Math.floor(Math.random() * 4)] : bloodType;
     const loc = city ? city : 'Downtown Area';
     
     return Array.from({ length: 3 }).map((_, i) => ({
        id: `ai-fallback-${Date.now()}-${i}`,
        username: `donor_${Math.floor(Math.random() * 1000)}`,
        name: `Volunteer Donor ${i + 1}`,
        role: UserRole.DONOR,
        bloodType: bType,
        location: `${loc} - Sector ${Math.floor(Math.random() * 10)}`,
        phone: `+1-555-01${Math.floor(10 + Math.random() * 89)}`,
        isVerified: true,
        joinDate: '2023-10-01'
      }));
  };

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Generate 3 fictional blood donor profiles.
    Context: User is searching for donors with Blood Type: "${bloodType}" in City: "${city}".
    If Blood Type is "All", mix them up. If City is empty, use "Metropolis".
    
    Return valid JSON data with these fields: name, bloodType, location (include neighborhood), phone (fake).`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              bloodType: { type: Type.STRING },
              location: { type: Type.STRING },
              phone: { type: Type.STRING }
            },
            required: ["name", "bloodType", "location", "phone"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return generateFallback();

    const data = JSON.parse(text);
    
    return data.map((d: any, i: number) => ({
      id: `ai-gen-${Date.now()}-${i}`,
      username: `donor_${d.name.replace(/\s+/g, '').toLowerCase()}`,
      name: d.name,
      role: UserRole.DONOR,
      bloodType: d.bloodType,
      location: d.location,
      phone: d.phone,
      isVerified: Math.random() > 0.2,
      joinDate: new Date().toISOString().split('T')[0]
    }));

  } catch (error) {
    console.error("Gemini Donor Search Error:", error);
    return generateFallback();
  }
};
