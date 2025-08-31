import { NextResponse } from 'next/server';
import { imageGenerationModel } from '@/lib/gemini';
import cloudinary from '@/lib/cloudinary';

// A simple helper for consistent logging
const log = (level, message, ...args) => {
    console[level](`[GENERATE_API] ${message}`, ...args);
};

/**
 * Generates a single image, with a built-in retry mechanism.
 * @param {string} basePrompt - The base prompt for the image.
 * @param {string|null} imageData - Optional base64 image data.
 * @param {number} imageIndex - The index of the image being generated (for logging).
 * @returns {Promise<object|null>} The successful response object from the model, or null if it fails.
 */
const generateSingleImageWithRetries = async (basePrompt, imageData, imageIndex) => {
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        log('info', `Generating image #${imageIndex + 1}, attempt ${attempt}...`);

        let promptForThisAttempt = basePrompt;
        if (attempt > 1) {
            promptForThisAttempt = `A high-quality, professional photograph of: ${basePrompt}`;
        }

        const generationPayload = [{ text: promptForThisAttempt }];
        if (imageData) {
            generationPayload.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData.startsWith('data:') ? imageData.split(',')[1] : imageData,
                },
            });
        }

        try {
            const result = await imageGenerationModel.generateContent(generationPayload);
            const response = result.response;
            const hasValidCandidate = response.candidates?.some(
                c => c.content?.parts?.some(part => part.inlineData)
            );

            if (hasValidCandidate) {
                log('info', `Successfully generated image #${imageIndex + 1}.`);
                return response; // Success, return the response
            }

            const reason = response.candidates?.[0]?.finishReason || 'Unknown';
            log('warn', `Attempt ${attempt} for image #${imageIndex + 1} failed. Reason: ${reason}`);

        } catch (error) {
             log('error', `An error occurred during generation attempt ${attempt} for image #${imageIndex + 1}:`, error.message);
        }
    }

    log('error', `All attempts failed for image #${imageIndex + 1}.`);
    return null; // All retries failed
};

export async function POST(req) {
    try {
        const { rewritten_prompt, negative_prompt, ratio, composition_notes, imageData } = await req.json();

        if (!rewritten_prompt) {
            return NextResponse.json({ error: 'Missing required prompt fields' }, { status: 400 });
        }

        const basePrompt = `${rewritten_prompt}. ${composition_notes}. Use a ${ratio} aspect ratio. Avoid generating: ${negative_prompt}.`;

        // --- MODIFIED LOGIC: GENERATE 4 IMAGES IN PARALLEL ---
        // Create an array of 4 promises, each one generating a single image.
        const generationPromises = Array(4).fill(null).map((_, index) =>
            generateSingleImageWithRetries(basePrompt, imageData, index)
        );

        // Wait for all promises to settle (either succeed or fail).
        const settledResponses = await Promise.all(generationPromises);

        // Filter out any attempts that failed completely (returned null).
        const successfulResponses = settledResponses.filter(Boolean);

        if (successfulResponses.length === 0) {
            throw new Error('All 4 image generation attempts failed completely.');
        }
        
        // Combine all candidates from all successful responses into a single array.
        const allCandidates = successfulResponses.flatMap(response => response.candidates);

        if (!allCandidates || allCandidates.length === 0) {
             // This case handles if responses were received but were empty or blocked.
            return NextResponse.json({ error: 'Generation succeeded but no valid images were returned.' }, { status: 500 });
        }

        const uploadPromises = allCandidates.map(async (candidate, index) => {
            const imagePart = candidate.content?.parts?.find(part => part.inlineData);
            if (!imagePart) {
                log('warn', `Skipping invalid candidate at index ${index}.`);
                return null;
            }
            const base64Data = imagePart.inlineData.data;
            try {
                const uploadResult = await cloudinary.uploader.upload(
                    `data:image/png;base64,${base64Data}`,
                    { folder: 'pixinelab_thumbnails' }
                );
                return uploadResult.secure_url;
            } catch (uploadError) {
                log('error', `Cloudinary upload failed for candidate ${index}:`, uploadError.message);
                return null;
            }
        });

        const imageUrls = (await Promise.all(uploadPromises)).filter(Boolean);

        if (imageUrls.length === 0) {
            log('warn', 'Generation succeeded, but all image uploads failed. Returning empty array.');
        } else {
            log('info', `Successfully generated and uploaded ${imageUrls.length} image(s).`);
        }

        return NextResponse.json({ images: imageUrls });
    } catch (error) {
        log('error', '[FATAL_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}