// src/ai/flows/check-answer-flow.ts
'use server';

/**
 * @fileOverview Provides a Genkit flow to check a user's answer to a puzzle.
 *
 * - checkAnswer - A function that evaluates a user's puzzle answer.
 * - CheckAnswerInput - The input type for the checkAnswer function.
 * - CheckAnswerOutput - The return type for the checkAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckAnswerInputSchema = z.object({
  originalPuzzle: z.string().describe('The original puzzle text presented to the user.'),
  originalSolution: z.string().describe('The correct solution to the puzzle.'),
  userAnswer: z.string().describe("The user's submitted answer to the puzzle."),
  puzzleType: z.string().optional().describe('The type of the puzzle (e.g., Riddle, Logic Puzzle). This can help in providing more relevant feedback.'),
  difficulty: z.string().optional().describe('The difficulty of the puzzle. This can help in tailoring feedback sensitivity.')
});
export type CheckAnswerInput = z.infer<typeof CheckAnswerInputSchema>;

const CheckAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user\'s answer is considered correct.'),
  isPartiallyCorrect: z.boolean().describe('Whether the user\'s answer is considered partially correct, even if not fully correct.'),
  feedback: z.string().describe('Constructive feedback for the user regarding their answer. This should be encouraging and helpful, guiding them if their answer is incorrect or partially correct. If correct, it should be congratulatory.'),
  confidenceScore: z.number().min(0).max(1).optional().describe('A score between 0 and 1 indicating the AI\'s confidence in the correctness evaluation.')
});
export type CheckAnswerOutput = z.infer<typeof CheckAnswerOutputSchema>;

export async function checkAnswer(input: CheckAnswerInput): Promise<CheckAnswerOutput> {
  return checkAnswerFlow(input);
}

const checkAnswerPrompt = ai.definePrompt({
  name: 'checkAnswerPrompt',
  input: {schema: CheckAnswerInputSchema},
  output: {schema: CheckAnswerOutputSchema},
  prompt: `You are an AI assistant specialized in evaluating puzzle answers.
Your goal is to determine if the user's answer is correct, partially correct, or incorrect, and provide helpful, encouraging feedback.

Context about the puzzle:
Puzzle Type: {{{puzzleType}}}
Difficulty: {{{difficulty}}}

Original Puzzle:
{{{originalPuzzle}}}

Correct Solution:
{{{originalSolution}}}

User's Submitted Answer:
{{{userAnswer}}}

Evaluation Criteria:
1.  **Correctness (isCorrect):** Compare the user's answer strictly against the original solution.
    - If the user's answer exactly matches or is a very close semantic equivalent to the original solution, set isCorrect to true.
    - Otherwise, set isCorrect to false.

2.  **Partial Correctness (isPartiallyCorrect):**
    - If isCorrect is true, isPartiallyCorrect should also be true.
    - If isCorrect is false, assess if the user's answer demonstrates some understanding or gets part of the solution right. For example, in a multi-part riddle, they might solve one part. Or for a logic puzzle, their reasoning might be partially sound.
    - If there's some merit, set isPartiallyCorrect to true. Otherwise, set it to false.

3.  **Feedback (feedback):**
    - If isCorrect is true: Provide positive reinforcement (e.g., "Excellent! That's the correct answer.", "You got it! Well done.").
    - If isPartiallyCorrect is true (but isCorrect is false): Acknowledge what they got right and gently guide them towards the full solution (e.g., "You're on the right track! You've correctly identified X, but consider Y.", "Good effort! Part of your answer is correct. Think about...").
    - If both are false: Provide encouraging and constructive feedback. Avoid simply saying "wrong." Try to hint at the core concept or suggest a different approach (e.g., "Not quite, but keep thinking! Try to focus on [aspect of puzzle].", "That's an interesting take! However, the solution lies more in the direction of [hint].").
    - The feedback should be concise and supportive.

4.  **Confidence Score (confidenceScore):** (Optional) Provide your confidence in this evaluation, from 0.0 to 1.0.

Analyze the user's answer based on these criteria and provide the output in the specified JSON format.
Be mindful of ambiguity. If the puzzle or solution is inherently ambiguous, be more lenient.
For riddles, slight variations in wording for the user's answer might still be correct if the core meaning is the same.
For logic or math problems, the answer is usually more precise.
`,
});

const checkAnswerFlow = ai.defineFlow(
  {
    name: 'checkAnswerFlow',
    inputSchema: CheckAnswerInputSchema,
    outputSchema: CheckAnswerOutputSchema,
  },
  async input => {
    const {output} = await checkAnswerPrompt(input);
    return output!;
  }
);
