"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleGeneratePuzzleAction } from "@/lib/actions";
import type { GeneratePuzzleOutput, GeneratePuzzleInput } from "@/ai/flows/generate-puzzle";
import { Wand2 } from "lucide-react";
import { useEffect } from "react";

const puzzleTypes = ["Riddle", "Logic Puzzle", "Math Problem", "Word Scramble", "Analogy Puzzle"];
const difficulties = ["Easy", "Medium", "Hard"] as const;

const formSchema = z.object({
  puzzleType: z.string().min(1, { message: "Please select or enter a puzzle type." }),
  difficulty: z.enum(difficulties, { required_error: "Please select a difficulty." }),
});

type PuzzleFormValues = z.infer<typeof formSchema>;

interface PuzzleGeneratorFormProps {
  onPuzzleGenerated: (data: GeneratePuzzleOutput, params: { puzzleType: string; difficulty: string }) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  currentParams: { puzzleType: string; difficulty: string } | null;
}

export default function PuzzleGeneratorForm({
  onPuzzleGenerated,
  setIsLoading,
  setError,
  currentParams,
}: PuzzleGeneratorFormProps) {
  const form = useForm<PuzzleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      puzzleType: "",
      difficulty: "Medium",
    },
  });

  async function onSubmit(values: PuzzleFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await handleGeneratePuzzleAction(values as GeneratePuzzleInput);
      if ("error" in result) {
        setError(result.error);
      } else {
        onPuzzleGenerated(result, values);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    if (currentParams && 
        (form.getValues("puzzleType") !== currentParams.puzzleType || form.getValues("difficulty") !== currentParams.difficulty)) {
      // This effect is to trigger regeneration if currentParams are updated externally (e.g. by 'regenerate' button)
      // and are different from current form values. Or, if currentParams are passed initially.
      // However, for explicit regeneration, it's better to call onSubmit directly or have a dedicated function.
      // For this setup, regeneration is handled by HomePage calling onSubmit via a ref or similar, or HomePage setting new params and this form reacting.
      // The current HomePage logic re-renders which might cause this form to re-submit if not careful.
      // Let's simplify: regeneration button in PuzzleDisplay will call a prop that triggers onSubmit in HomePage,
      // or HomePage calls a function exposed by this form.
      // For now, let's assume if currentParams changes, we want to potentially regenerate.
      // This is a bit tricky. The HomePage's regenerate logic clears puzzleData and sets currentParams, then this form should pick it up.
      // A simpler regeneration method would be for PuzzleDisplay to call onSubmit with currentParams.
      // Let's make this effect responsible for triggering generation when currentParams changes meaningfully.
      if(form.getValues("puzzleType") !== currentParams.puzzleType || form.getValues("difficulty") !== currentParams.difficulty) {
        // If form values are different, it means this is a *new* request via currentParams
        form.setValue("puzzleType", currentParams.puzzleType);
        form.setValue("difficulty", currentParams.difficulty as "Easy" | "Medium" | "Hard");
      }
      // Automatically submit if currentParams are set (e.g., for regeneration)
      // This ensures that if `onRegenerate` sets `currentPuzzleParams` in HomePage, this form picks it up and submits.
      onSubmit(currentParams as PuzzleFormValues);
    }
  }, [currentParams]);


  return (
    <div className="w-full p-6 bg-card shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-card-foreground">Generate a New Puzzle</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="puzzleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puzzle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a puzzle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {puzzleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <Wand2 className="mr-2 h-5 w-5" />
            Generate Puzzle
          </Button>
        </form>
      </Form>
    </div>
  );
}
