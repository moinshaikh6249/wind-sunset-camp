'use server';

import { suggestImageMetadata } from '@/ai/flows/suggest-image-metadata';

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        
        // This is a server action, but we need to read the file.
        // A better way would be to use Buffer, but let's see if this works.
        // A more node-native way:
        const toBase64 = (buffer: ArrayBuffer) => Buffer.from(buffer).toString('base64');
        
        file.arrayBuffer().then(buffer => {
            const base64 = toBase64(buffer);
            resolve(`data:${file.type};base64,${base64}`);
        }).catch(reject);
    });
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
