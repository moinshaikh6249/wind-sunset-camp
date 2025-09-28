'use server';
/**
 * @fileOverview An AI agent that suggests completions for fields in the booking form based on minimal input.
 *
 * - suggestBookingFormCompletion - A function that handles the booking form completion process.
 * - SuggestBookingFormCompletionInput - The input type for the suggestBookingFormCompletion function.
 * - SuggestBookingFormCompletionOutput - The return type for the suggestBookingFormCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBookingFormCompletionInputSchema = z.object({
  partialForm: z.record(z.string()).describe('A record containing the fields already filled in the booking form. Keys are field names, values are the field values.'),
  availableOptions: z.record(z.array(z.string())).optional().describe('A record containing a list of valid values for specific fields in the booking form, if applicable. Keys are field names, values are the valid options for that field.'),
});
export type SuggestBookingFormCompletionInput = z.infer<typeof SuggestBookingFormCompletionInputSchema>;

const SuggestBookingFormCompletionOutputSchema = z.record(z.string()).describe('A record containing the suggested completions for the remaining fields in the booking form. Keys are field names, values are the suggested field values.');
export type SuggestBookingFormCompletionOutput = z.infer<typeof SuggestBookingFormCompletionOutputSchema>;

export async function suggestBookingFormCompletion(input: SuggestBookingFormCompletionInput): Promise<SuggestBookingFormCompletionOutput> {
  return suggestBookingFormCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBookingFormCompletionPrompt',
  input: {schema: SuggestBookingFormCompletionInputSchema},
  output: {schema: SuggestBookingFormCompletionOutputSchema},
  prompt: `You are an AI assistant designed to help users quickly complete booking forms.

  Based on the information provided, suggest completions for the remaining fields in the form.

  Partial Form Data:
  {{#each partialForm}}
  {{@key}}: {{{this}}}
  {{/each}}

  {{#if availableOptions}}
  Available Options:
  {{#each availableOptions}}
    {{@key}}: {{this}}
  {{/each}}
  {{/if}}

  Please provide the completed form data as a JSON object.  Only return valid options where provided in availableOptions.
  `,
});

const suggestBookingFormCompletionFlow = ai.defineFlow(
  {
    name: 'suggestBookingFormCompletionFlow',
    inputSchema: SuggestBookingFormCompletionInputSchema,
    outputSchema: SuggestBookingFormCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
