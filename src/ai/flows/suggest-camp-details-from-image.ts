
'use server';
/**
 * @fileOverview An AI agent that suggests a description and activities for a camp based on an image and name.
 *
 * - suggestCampDetailsFromImage - A function that handles the camp detail suggestion process.
 * - SuggestCampDetailsFromImageInput - The input type for the suggestCampDetailsFromImage function.
 * - SuggestCampDetailsFromImageOutput - The return type for the suggestCampDetailsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCampDetailsFromImageInputSchema = z.object({
  campName: z.string().describe('The name of the camp.'),
  imageDataUri: z
    .string()
    .describe(
      "A photo of the camp, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestCampDetailsFromImageInput = z.infer<typeof SuggestCampDetailsFromImageInputSchema>;

const SuggestCampDetailsFromImageOutputSchema = z.object({
  description: z.string().describe('A compelling, one-paragraph description for the camp inspired by the image.'),
  activities: z.array(z.string()).describe('A list of 3-5 engaging activities suitable for the camp, inspired by the image.'),
});
export type SuggestCampDetailsFromImageOutput = z.infer<typeof SuggestCampDetailsFromImageOutputSchema>;


export async function suggestCampDetailsFromImage(input: SuggestCampDetailsFromImageInput): Promise<SuggestCampDetailsFromImageOutput> {
  return suggestCampDetailsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCampDetailsFromImagePrompt',
  input: {schema: SuggestCampDetailsFromImageInputSchema},
  output: {schema: SuggestCampDetailsFromImageOutputSchema},
  prompt: `You are a creative director for a company called "Wind & Sunset Camp". Your task is to generate an exciting, one-paragraph marketing description and a list of 3 to 5 sample activities for a new camp, inspired by the provided image and camp name.

Camp Name: {{{campName}}}

Analyze the image provided and generate a description and a list of activities that fit the visual theme and mood. Make it sound adventurous and appealing to a general audience.

Image for inspiration: {{media url=imageDataUri}}`,
});

const suggestCampDetailsFromImageFlow = ai.defineFlow(
  {
    name: 'suggestCampDetailsFromImageFlow',
    inputSchema: SuggestCampDetailsFromImageInputSchema,
    outputSchema: SuggestCampDetailsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
