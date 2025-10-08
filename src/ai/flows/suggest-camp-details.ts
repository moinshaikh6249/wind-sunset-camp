
'use server';
/**
 * @fileOverview An AI agent that suggests a description and activities for a camp.
 *
 * - suggestCampDetails - A function that handles the camp detail suggestion process.
 * - SuggestCampDetailsInput - The input type for the suggestCampDetails function.
 * - SuggestCampDetailsOutput - The return type for the suggestCampDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCampDetailsInputSchema = z.object({
  campName: z.string().describe('The name of the camp.'),
});
export type SuggestCampDetailsInput = z.infer<typeof SuggestCampDetailsInputSchema>;

const SuggestCampDetailsOutputSchema = z.object({
  description: z.string().describe('A compelling, one-paragraph description for the camp.'),
  activities: z.array(z.string()).describe('A list of 3-5 engaging activities suitable for the camp.'),
});
export type SuggestCampDetailsOutput = z.infer<typeof SuggestCampDetailsOutputSchema>;


export async function suggestCampDetails(input: SuggestCampDetailsInput): Promise<SuggestCampDetailsOutput> {
  return suggestCampDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCampDetails',
  input: {schema: SuggestCampDetailsInputSchema},
  output: {schema: SuggestCampDetailsOutputSchema},
  prompt: `You are a creative director for a company called "Wind & Sunset Camp". Your task is to generate an exciting, one-paragraph marketing description and a list of 3 to 5 sample activities for a new camp.

Camp Name: {{{campName}}}

Generate the description and activities based on the camp name. Make it sound adventurous and appealing to a general audience.`,
});

const suggestCampDetailsFlow = ai.defineFlow(
  {
    name: 'suggestCampDetailsFlow',
    inputSchema: SuggestCampDetailsInputSchema,
    outputSchema: SuggestCampDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
