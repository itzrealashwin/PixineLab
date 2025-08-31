import { NextResponse } from 'next/server';
import { imageGenerationModel } from '@/lib/gemini';
import cloudinary from '@/lib/cloudinary';
import { writeFileSync } from "fs"
export async function POST(req) {
  try {
    // Now accepting an optional imageData field for image modification.
    const { rewritten_prompt, negative_prompt, ratio, composition_notes, imageData } = await req.json();
    writeFileSync('geminiprompt.txt', rewritten_prompt + "\n \n");

    if (!rewritten_prompt) {
      return NextResponse.json({ error: 'Missing required prompt fields' }, { status: 400 });
    }

    const basePrompt = `${rewritten_prompt}. ${composition_notes}. Use a ${ratio} aspect ratio. Avoid generating: ${negative_prompt}. Use model imageData. `;
    writeFileSync('geminiprompt.txt', basePrompt + "\n \n");

    let response;
    const MAX_RETRIES = 2;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      log(`[DEBUG] Image generation attempt ${attempt} of ${MAX_RETRIES}...`);

      let promptForThisAttempt = basePrompt;
      if (attempt > 1) {
        // Modify the prompt slightly for the retry attempt
        promptForThisAttempt = `A high-quality, professional photograph of: ${basePrompt}`;
        log('[DEBUG] Using modified prompt for retry.');
      }

      const generationPayload = [{ text: promptForThisAttempt }];
      if (imageData) {
        log('[DEBUG] Image data provided. Attaching to payload.');
        generationPayload.push({
          inlineData: {
            mimeType: 'image/jpeg', // Or detect dynamically

            data: imageData,
          },
        });
      }

      const result = await imageGenerationModel.generateContent(generationPayload);
      response = result.response;

      // --- FIX IS HERE ---
      // A candidate is valid if it contains image data, regardless of the finishReason.
      const hasValidCandidate = response.candidates?.some(
        c => c.content?.parts?.some(part => part.inlineData)
      );

      if (hasValidCandidate) {
        log(`[DEBUG] Success on attempt ${attempt}. Proceeding to upload.`);
        break;
      } else {
        warn(`[WARN] Attempt ${attempt} failed to produce a valid image candidate. Reason: ${response.candidates?.[0]?.finishReason || 'Unknown'}`);
        if (attempt === MAX_RETRIES) {
          error('[ERROR] All retry attempts failed.');
        }
      }
    }

    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        return NextResponse.json({ error: `Prompt was blocked due to safety concerns: ${blockReason}` }, { status: 400 });
      }
      return NextResponse.json({ images: [] });
    }

    const uploadPromises = candidates.map(async (candidate, index) => {
      const imagePart = candidate.content?.parts?.find(part => part.inlineData);

      // --- FIX IS HERE ---
      // We only check for the existence of the image part now.
      if (!imagePart) {
        warn(`[WARN] Skipping invalid candidate at index ${index}. Reason: ${candidate.finishReason || 'No Image Data'}.`);
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
        error('[ERROR] Cloudinary upload failed for a candidate:', uploadError.message);
        return null;
      }
    });

    const imageUrls = (await Promise.all(uploadPromises)).filter(Boolean);

    if (imageUrls.length === 0) {
      warn('[WARN] All valid candidates failed to upload. Returning empty array.');
    } else {
      log('[DEBUG] Successfully uploaded image URLs:', imageUrls);
    }

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    error('[GENERATE_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

