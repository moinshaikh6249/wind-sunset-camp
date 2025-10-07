
'use server';

import { suggestCampDetails } from '@/ai/flows/suggest-camp-details';

export async function getCampSuggestions(campName: string) {
    if (!campName) {
        throw new Error('Camp name is required to get suggestions.');
    }

    try {
        const suggestions = await suggestCampDetails({ campName });
        return suggestions;
    } catch (error) {
        console.error('Error getting AI camp suggestions:', error);
        throw new Error('Failed to get suggestions from the AI model.');
    }
}
