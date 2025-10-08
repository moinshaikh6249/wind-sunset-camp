
'use server';

import { suggestCampDetails } from '@/ai/flows/suggest-camp-details';
import { suggestCampDetailsFromImage } from '@/ai/flows/suggest-camp-details-from-image';

/**
 * Converts a File object to a Base64-encoded data URI on the server.
 * @param file The image file to convert.
 * @returns A promise that resolves with the data URI.
 */
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export async function getCampSuggestions(formData: FormData) {
    const campName = formData.get('campName') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!campName) {
        throw new Error('Camp name is required to get suggestions.');
    }

    // If an image is provided, use the image-based suggestion flow.
    if (imageFile) {
         const imageDataUri = await fileToDataUri(imageFile);
         try {
            const suggestions = await suggestCampDetailsFromImage({ campName, imageDataUri });
            return suggestions;
        } catch (error) {
            console.error('Error getting AI camp suggestions from image:', error);
            throw new Error('Failed to get suggestions from the AI model using the image.');
        }
    }

    // Otherwise, fall back to the name-based suggestion flow.
    try {
        const suggestions = await suggestCampDetails({ campName });
        return suggestions;
    } catch (error) {
        console.error('Error getting AI camp suggestions:', error);
        throw new Error('Failed to get suggestions from the AI model.');
    }
}
