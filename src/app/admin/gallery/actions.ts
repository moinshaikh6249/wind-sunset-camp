'use server';

import { suggestImageMetadata } from '@/ai/flows/suggest-image-metadata';

/**
 * Converts a File object to a Base64-encoded data URI on the server.
 * This function is safe to use in a Next.js Server Action.
 * @param file The image file to convert.
 * @returns A promise that resolves with the data URI.
 */
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export async function getSuggestions(formData: FormData) {
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
        throw new Error('No image file provided.');
    }

    const imageDataUri = await fileToDataUri(imageFile);

    try {
        const suggestions = await suggestImageMetadata({ imageDataUri });
        return suggestions;
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        throw new Error('Failed to get suggestions from the AI model.');
    }
}
