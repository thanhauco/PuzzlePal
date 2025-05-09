// src/ai/flows/generate-puzzle.ts
'use server';

/**
 * @fileOverview Generates a brain teaser puzzle of a specified type using AI.
 *
 * - generatePuzzle - A function that generates a puzzle.
 * - GeneratePuzzleInput - The input type for the generatePuzzle function.
 * - GeneratePuzzleOutput - The return type for the generatePuzzle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePuzzleInputSchema = z.object({
  puzzleType: z
    .string()
    .describe('The type of brain teaser puzzle to generate (e.g., Sudoku, Crossword, Riddle).'),
  difficulty: z
    .string()
    .optional()
    .describe('The difficulty level of the puzzle (e.g., Easy, Medium, Hard).'),
});
export type GeneratePuzzleInput = z.infer<typeof GeneratePuzzleInputSchema>;

const GeneratePuzzleOutputSchema = z.object({
  title: z.string().describe('The title of the puzzle.'),
  puzzle: z.string().describe('The puzzle itself, in a format appropriate for the puzzle type.'),
  solution: z.string().describe('The solution to the puzzle.'),
  hints: z.array(z.string()).optional().describe('Hints for solving the puzzle.'),
  difficulty: z.string().describe('The difficulty level of the puzzle'),
});
export type GeneratePuzzleOutput = z.infer<typeof GeneratePuzzleOutputSchema>;

export async function generatePuzzle(input: GeneratePuzzleInput): Promise<GeneratePuzzleOutput> {
  return generatePuzzleFlow(input);
}

const generatePuzzlePrompt = ai.definePrompt({
  name: 'generatePuzzlePrompt',
  input: {schema: GeneratePuzzleInputSchema},
  output: {schema: GeneratePuzzleOutputSchema},
  prompt: `You are a puzzle generator AI. Generate a brain teaser puzzle of the specified type and difficulty.

  Puzzle Type: {{{puzzleType}}}
  Difficulty: {{{difficulty}}}

  Format the puzzle and solution in a way that is easy to understand.
  Include hints that might be useful for the user.  The puzzle should be appropriate for the specified difficulty.
  Always include difficulty in the output.
`,
});

const generatePuzzleFlow = ai.defineFlow(
  {
    name: 'generatePuzzleFlow',
    inputSchema: GeneratePuzzleInputSchema,
    outputSchema: GeneratePuzzleOutputSchema,
  },
  async input => {
    const {output} = await generatePuzzlePrompt(input);
    return output!;
  }
);
