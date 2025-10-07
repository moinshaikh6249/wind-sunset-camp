
'use server';

import { suggestBookingFormCompletion } from '@/ai/flows/booking-form-completion-suggester';

type Camp = {
    id: string;
    name: string;
};

/**
 * Gets AI-powered completion suggestions for the booking form.
 * @param partialForm - A record containing the fields already filled in the booking form.
 * @param upcomingCamps - An array of available camps.
 * @returns A record containing suggested completions for the remaining fields.
 */
export async function getCompletionSuggestions(
  partialForm: Record<string, string>,
  upcomingCamps: Camp[]
): Promise<Record<string, string>> {
  try {
    const availableCamps = {
      campName: upcomingCamps.map(c => c.name),
    };

    // Make sure not to send empty objects if no options are available
    const availableOptions = availableCamps.campName.length > 0 ? availableCamps : undefined;

    const suggestions = await suggestBookingFormCompletion({
      partialForm,
      availableOptions,
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error getting completion suggestions:', error);
    // In case of an error, return an empty object to prevent crashes.
    return {};
  }
}
