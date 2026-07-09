const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const menuSchema = {
  type: "object",
  properties: {
    dishes: {
      type: "array",
      description: "List of dishes identified on the menu.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", description: "Short description of the dish including key ingredients." },
          cal: { type: "number", description: "Estimated total calories per serving." },
          protein: { type: "number", description: "Estimated protein in grams." },
          carbs: { type: "number", description: "Estimated carbohydrates in grams." },
          fat: { type: "number", description: "Estimated total fat in grams." },
          fiber: { type: "number", description: "Estimated dietary fiber in grams." },
          sodium: { type: "number", description: "Estimated sodium in milligrams." },
          sugar: { type: "number", description: "Estimated sugars in grams." }
        },
        required: ["name", "description", "cal", "protein", "carbs", "fat", "fiber", "sodium", "sugar"]
      }
    }
  },
  required: ["dishes"]
};

/**
 * Parses restaurant menu content (text or image) using Gemini 2.5 Flash.
 * Returns a structured array of dishes with their nutrition estimates.
 */
async function parseMenuWithGemini({ menuText, imageData, mimeType }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please set it in server/.env.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a professional restaurant nutrition assistant.
Your task is to parse the restaurant menu provided (either as text or as a photo) and extract every single dish/drink item.
For each item, write a description containing its key ingredients and estimate its nutritional values per standard restaurant serving.
Make your estimations as accurate as possible.

Provide the response in the exact JSON schema requested.`;

  const parts = [{ text: prompt }];

  if (imageData) {
    parts.push({
      inlineData: {
        data: imageData,
        mimeType: mimeType || 'image/jpeg'
      }
    });
  } else if (menuText) {
    parts.push({ text: menuText });
  } else {
    throw new Error('Either menuText or imageData is required.');
  }

  const contents = [
    {
      role: 'user',
      parts
    }
  ];

  const result = await model.generateContent({
    contents,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: menuSchema
    }
  });

  const responseText = result.response.text();
  try {
    const data = JSON.parse(responseText);
    return data.dishes || [];
  } catch (err) {
    console.error('Failed to parse JSON response from Gemini:', responseText);
    throw new Error('Gemini did not return valid JSON output matching the schema.');
  }
}

module.exports = { parseMenuWithGemini };
