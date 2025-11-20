import { GoogleGenAI, Type } from "@google/genai";
import { User, UserRole } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getHealthTip = async (userRole: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Stay hydrated and eat healthy to maintain good blood levels.";

  try {
    const model = "gemini-2.5-flash";
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

export const chatWithSamrat = async (message: string, context: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I am currently offline. Please check your connection.";

  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are Samrat, a friendly, intelligent, and 24/7 AI assistant for the LifeFlow Blood Bank System. 
    Your goal is to help Admins, Donors, and Recipients with their queries about blood donation, health, or navigating the system.
    
    Current User Context: ${context}
    
    Keep answers concise, professional, and helpful. 
    If asked about medical advice, strictly advise consulting a doctor. 
    Use a warm, encouraging tone.`;

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I didn't quite catch that. Could you rephrase?";
  } catch (error) {
    console.error("Samrat Error:", error);
    return "My systems are having a moment. Please try again later.";
  }
};

export const findDonorsWithAI = async (bloodType: string, city: string): Promise<User[]> => {
  const ai = getAiClient();
  
  // Fallback generator if AI is offline or fails
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

  if (!ai) return generateFallback();

  try {
    const model = "gemini-2.5-flash";
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
    
    // Map JSON response to User interface
    return data.map((d: any, i: number) => ({
      id: `ai-gen-${Date.now()}-${i}`,
      username: `donor_${d.name.replace(/\s+/g, '').toLowerCase()}`,
      name: d.name,
      role: UserRole.DONOR,
      bloodType: d.bloodType,
      location: d.location,
      phone: d.phone,
      isVerified: Math.random() > 0.2, // Randomly verify most
      joinDate: new Date().toISOString().split('T')[0]
    }));

  } catch (error) {
    console.error("Gemini Donor Search Error:", error);
    return generateFallback();
  }
};