import { GoogleGenAI, Type } from "@google/genai";
import { BrandIdentity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateBrandIdentity(
  description: string,
  logoBase64?: string
): Promise<BrandIdentity> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a world-class brand designer. 
    Based on the following brand description, generate a comprehensive brand identity system.
    
    Brand Description: ${description}
    
    Return a JSON object matching this schema:
    {
      "name": "Brand Name",
      "tagline": "Short catchy tagline",
      "colors": {
        "primary": "#HEX",
        "secondary": ["#HEX", "#HEX"],
        "neutral": ["#HEX", "#HEX"]
      },
      "typography": {
        "fontFamily": "Font Name",
        "headings": "Heading Style Description",
        "body": "Body Style Description"
      },
      "narrative": "A professional brand narrative (approx 100 words)",
      "logoSystem": {
        "primary": "Description of the primary logo lockup",
        "logomark": "Description of the logomark icon",
        "wordmark": "Description of the wordmark typography",
        "monochrome": "Description of the monochrome version",
        "appIcon": "Description of the app icon version"
      }
    }
  `;

  const parts: any[] = [{ text: prompt }];
  if (logoBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: logoBase64.split(",")[1] || logoBase64,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          colors: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
              neutral: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          typography: {
            type: Type.OBJECT,
            properties: {
              fontFamily: { type: Type.STRING },
              headings: { type: Type.STRING },
              body: { type: Type.STRING }
            }
          },
          narrative: { type: Type.STRING },
          logoSystem: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              logomark: { type: Type.STRING },
              wordmark: { type: Type.STRING },
              monochrome: { type: Type.STRING },
              appIcon: { type: Type.STRING }
            }
          }
        },
        required: ["name", "tagline", "colors", "typography", "narrative", "logoSystem"]
      }
    },
  });

  return JSON.parse(response.text || "{}");
}
