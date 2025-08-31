import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generativeModel } from '@/lib/gemini';
import { systemPrompt } from './systemPrompt.js';

// --- FIXED SCHEMA ---
// Removed the invalid .min() calls. .optional() is sufficient.
const rewriteSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  niche: z.string().min(2).max(50),
  mood: z.string().min(2).max(50),
  placement: z.enum(['left', 'right', 'center']),
  thumbnailText: z.string().max(200).optional(),
  textColor: z.string().max(50).optional(),
  ratio: z.string().min(2).max(20).optional(),
  style: z.string().min(2).max(50).optional(),
  imageAvailable: z.string().optional(), // This is a text hint, not image data
});

// Helper for consistent logging
const log = (level, message, ...args) => {
    console[level](`[REWRITE_API] ${message}`, ...args);
};

export async function POST(req) {
  try {
    const body = await req.json();

    const validatedBody = rewriteSchema.safeParse(body);

    if (!validatedBody.success) {
      log('warn', 'Invalid input received:', validatedBody.error.flatten());
      return NextResponse.json({ error: 'Invalid input', details: validatedBody.error.flatten() }, { status: 400 });
    }

    const { imageAvailable, ...textInputs } = validatedBody.data;

    // --- IMPROVED PROMPT CONSTRUCTION ---
    // Convert the user's inputs into a clean, readable format for the AI.
    const userInputString = Object.entries(textInputs)
      .filter(([, value]) => value !== undefined && value !== null) // Filter out empty optional fields
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Conditionally add the image availability hint to avoid adding "false" to the prompt.
    let fullPrompt = `${systemPrompt}\n\nUser Input:\n${userInputString}`;
    if (imageAvailable) {
      fullPrompt += `\nimage_hint: ${imageAvailable}`;
    }

    const result = await generativeModel.generateContent(fullPrompt);
    
    // Check for response and text existence
    const responseText = result.response?.text();
    if (!responseText) {
        log('error', 'Received an empty or invalid response from Gemini.', result.response);
        throw new Error("Received an empty response from the AI model.");
    }

    // --- FIXED JSON PARSING ---
    // Safely parse the response in its own try-catch block.
    let parsedJson;
    try {
        parsedJson = JSON.parse(responseText);
    } catch (parseError) {
        log('error', 'Failed to parse JSON response from Gemini.', `Response text: "${responseText}"`, parseError);
        throw new Error('The AI model returned a response that was not valid JSON.');
    }

    return NextResponse.json(parsedJson);

  } catch (error) {
    log('error', '[FATAL_ERROR]', error);
    // Log more detailed error from Gemini if available
    if (error.errorDetails) {
      log('error', 'Gemini Error Details:', error.errorDetails);
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}