// src/lib/actions.ts
"use server";

import { generatePuzzle, type GeneratePuzzleInput, type GeneratePuzzleOutput } from "@/ai/flows/generate-puzzle";
import { checkAnswer, type CheckAnswerInput, type CheckAnswerOutput } from "@/ai/flows/check-answer-flow";

export async function handleGeneratePuzzleAction(input: GeneratePuzzleInput): Promise<GeneratePuzzleOutput | { error: string }> {
  try {
    console.log("Generating puzzle with input:", input);
    const result = await generatePuzzle(input);
    if (!result || typeof result.puzzle !== 'string') { 
        console.error("AI returned invalid data structure for puzzle generation:", result);
        return { error: "The AI generated an invalid puzzle format. Please try again." };
    }
    return result;
  } catch (e) {
    console.error("Error generating puzzle:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating the puzzle.";
    return { error: errorMessage };
  }
}

export async function handleCheckAnswerAction(input: CheckAnswerInput): Promise<CheckAnswerOutput | { error: string }> {
  try {
    console.log("Checking answer with input:", input);
    const result = await checkAnswer(input);
     if (!result || typeof result.feedback !== 'string' || typeof result.isCorrect !== 'boolean') {
        console.error("AI returned invalid data structure for answer checking:", result);
        return { error: "The AI returned an invalid feedback format. Please try again." };
    }
    return result;
  } catch (e) {
    console.error("Error checking answer:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while checking the answer.";
    return { error: errorMessage };
  }
}
