"use server";

import { suggestBookingFormCompletion, SuggestBookingFormCompletionInput } from '@/ai/flows/booking-form-completion-suggester';
import { upcomingCamps } from '@/lib/mock-data';

export async function getCompletionSuggestions(
  partialForm: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const availableOptions: Record<string, string[]> = {
      campName: upcomingCamps.map(camp => camp.name),
    };

    const input: SuggestBookingFormCompletionInput = {
      partialForm,
      availableOptions,
    };
    
    // To make suggestions more useful, if a camp name is provided,
    // let's find its details and add them to the context for the AI.
    const campName = partialForm.campName;
    if (campName) {
      const selectedCamp = upcomingCamps.find(camp => camp.name === campName);
      if (selectedCamp) {
        input.partialForm.campDetails = `Date: ${selectedCamp.date}, Location: ${selectedCamp.location}`;
      }
    }
    
    const suggestions = await suggestBookingFormCompletion(input);
    return suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return {};
  }
}
