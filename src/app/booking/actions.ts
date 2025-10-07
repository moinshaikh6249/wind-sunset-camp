
'use server';

// This file is no longer used for AI suggestions, but is kept as a placeholder
// in case server-side actions are needed for the booking form in the future.

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
  // AI functionality has been removed from the booking form.
  return {};
}
