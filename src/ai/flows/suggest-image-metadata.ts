'use server';
/**
 * @fileOverview An AI agent that suggests metadata for an uploaded image.
 *
 * - suggestImageMetadata - A function that handles the image metadata suggestion process.
 * - SuggestImageMetadataInput - The input type for the suggestImageMetadata function.
 * - SuggestImageMetadataOutput - The return type for the suggestImageMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImageMetadataInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestImageMetadataInput = z.infer<typeof SuggestImageMetadataInputSchema>;

const SuggestImageMetadataOutputSchema = z.object({
  description: z.string().describe('A brief, engaging description of the image, suitable for a photo gallery.'),
  imageHint: z.string().describe('A two-word search hint that captures the essence of the image (e.g., "mountain lake", "forest path").'),
});
export type SuggestImageMetadataOutput = z.infer<typeof SuggestImageMetadataOutputSchema>;


export async function suggestImageMetadata(input: SuggestImageMetadataInput): Promise<SuggestImageMetadataOutput> {
  return suggestImageMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImageMetadataPrompt',
  input: {schema: SuggestImageMetadataInputSchema},
  output: {schema: SuggestImageMetadataOutputSchema},
  prompt: `You are an expert photo analyst for a camping company's website. Your task is to analyze the provided image and generate a concise, appealing description and a two-word search hint.

  - The description should be one sentence and capture the mood and subject of the photo.
  - The imageHint should be exactly two lowercase words that are highly relevant for searching for this image later.

  Analyze this image: {{media url=imageDataUri}}`,
});

const suggestImageMetadataFlow = ai.defineFlow(
  {
    name: 'suggestImageMetadataFlow',
    inputSchema: SuggestImageMetadataInputSchema,
    outputSchema: SuggestImageMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
