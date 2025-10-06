'use server';

import { suggestBookingFormCompletion } from '@/ai/flows/booking-form-completion-suggester';
import { upcomingCamps } from '@/lib/mock-data';

/**
 * Gets AI-powered completion suggestions for the booking form.
 * @param partialForm - A record containing the fields already filled in the booking form.
 * @returns A record containing suggested completions for the remaining fields.
 */
export async function getCompletionSuggestions(
  partialForm: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const availableCamps = {
      campName: upcomingCamps.map(c => c.name),
    };

    const suggestions = await suggestBookingFormCompletion({
      partialForm,
      availableOptions: availableCamps,
    });
    
    return suggestions;
  } catch (error) {
    console.error('Error getting completion suggestions:', error);
    // In case of an error, return an empty object to prevent crashes.
    return {};
  }
}
