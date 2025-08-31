import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generativeModel } from '@/lib/gemini';
import { systemPrompt } from './systemPrompt.js';

// Updated schema to accept an optional imageData string
const rewriteSchema = z.object({
  title: z.string().min(3).max(1000),
  niche: z.string().min(2).max(50),
  mood: z.string().min(2).max(50),
  placement: z.enum(['left', 'right', 'center']),
  thumbnailText: z.string().min().max(200).optional(),
  textColor: z.string().min().max(50).optional(),
  ratio: z.string().min(2).max(20).optional(), // e.g. "16:9"
  style: z.string().min(2).max(50).optional(),
  imageAvailable: z.string().optional(), // Base64 string / URL
});


export async function POST(req) {


  try {
    const body = await req.json();

    const validatedBody = rewriteSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ error: 'Invalid input', details: validatedBody.error.flatten() }, { status: 400 });
    }

    const { imageAvailable, ...textInputs } = validatedBody.data;


    // Construct the prompt using only the text inputs, regardless of whether an image was uploaded.
    const fullPrompt = `${systemPrompt}\n\nUser Input:\n${JSON.stringify(textInputs)} and ${imageAvailable && imageAvailable}`;
    const generationPayload = [{ text: fullPrompt }];

    const result = await generativeModel.generateContent({ contents: [{ parts: generationPayload }] });
    const response = result.response;
    const jsonText = response.text();

    if (!jsonText) {
      throw new Error("Received an empty response from Gemini.");
    }

    return NextResponse.json(JSON.parse(jsonText));

  } catch (error) {
    error('[REWRITE_API_ERROR]', error);
    // Log more detailed error from Gemini if available
    if (error.errorDetails) {
      error('Gemini Error Details:', error.errorDetails);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

