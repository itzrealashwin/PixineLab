import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY in .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.95,
  // candidateCount: 2, // ✅ generate 4 images
};

const IMAGE_MODEL_ID = 'gemini-2.5-flash-image-preview';
const TEXT_MODEL_ID = 'gemini-2.5-flash-lite';

// Client for generating multiple images
export const imageGenerationModel = genAI.getGenerativeModel({
  model: IMAGE_MODEL_ID,
  generationConfig,
});

// Text-based model (for prompt rewriting etc.)
export const generativeModel = genAI.getGenerativeModel({
  model: TEXT_MODEL_ID,
  generationConfig: {
    ...generationConfig,
    responseMimeType: 'application/json',
  },
});
