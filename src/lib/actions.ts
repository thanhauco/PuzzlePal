"use server";

import { generatePuzzle, type GeneratePuzzleInput, type GeneratePuzzleOutput } from "@/ai/flows/generate-puzzle";

export async function handleGeneratePuzzleAction(input: GeneratePuzzleInput): Promise<GeneratePuzzleOutput | { error: string }> {
  try {
    console.log("Generating puzzle with input:", input);
    const result = await generatePuzzle(input);
    if (!result || typeof result.puzzle !== 'string') { // Basic validation of AI output
        console.error("AI returned invalid data structure:", result);
        return { error: "The AI generated an invalid puzzle format. Please try again." };
    }
    return result;
  } catch (e) {
    console.error("Error generating puzzle:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating the puzzle.";
    return { error: errorMessage };
  }
}
