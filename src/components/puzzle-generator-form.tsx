// src/components/puzzle-generator-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GeneratePuzzleInput } from "@/ai/flows/generate-puzzle";
import { Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


const puzzleTypes = ["Riddle", "Logic Puzzle", "Math Problem", "Word Scramble", "Analogy Puzzle", "Lateral Thinking Puzzle", "Pattern Recognition"];
const difficulties = ["Easy", "Medium", "Hard", "Challenging"] as const;

const formSchema = z.object({
  puzzleType: z.string().min(1, { message: "Please select or enter a puzzle type." }),
  difficulty: z.enum(difficulties, { required_error: "Please select a difficulty." }),
});

type PuzzleFormValues = z.infer<typeof formSchema>;

interface PuzzleGeneratorFormProps {
  onPuzzleRequest: (params: GeneratePuzzleInput) => Promise<void>;
  setIsLoading: (loading: boolean) => void; // For the form's own submit button
  initialDifficulty?: typeof difficulties[number];
}

export default function PuzzleGeneratorForm({
  onPuzzleRequest,
  setIsLoading,
  initialDifficulty = "Medium",
}: PuzzleGeneratorFormProps) {
  const form = useForm<PuzzleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      puzzleType: puzzleTypes[0], // Default to the first puzzle type
      difficulty: initialDifficulty,
    },
  });

  async function onSubmit(values: PuzzleFormValues) {
    setIsLoading(true); // Indicate loading for the form's submit button
    await onPuzzleRequest(values as GeneratePuzzleInput);
    // setIsLoading(false) will be handled by the parent component (HomePage)
    // after the promise from onPuzzleRequest resolves or rejects.
  }

  return (
    <Card className="w-full shadow-xl rounded-xl border border-border/60 overflow-hidden">
      <CardHeader className="bg-muted/30 p-6">
        <CardTitle className="text-2xl font-semibold text-primary">Design Your Dilemma</CardTitle>
        <CardDescription className="text-muted-foreground pt-1 text-base">
          Choose your challenge and let our AI craft a unique puzzle for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="puzzleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">Puzzle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base focus:ring-primary focus:border-primary shadow-sm">
                        <SelectValue placeholder="Select a puzzle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {puzzleTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-base py-2">
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
                  <FormLabel className="text-lg font-medium">Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base focus:ring-primary focus:border-primary shadow-sm">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficulties.map((level) => (
                        <SelectItem key={level} value={level} className="text-base py-2">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full text-lg py-6 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md" 
              disabled={form.formState.isSubmitting}
              size="lg"
            >
              <Wand2 className="mr-2 h-6 w-6" />
              Generate Puzzle
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
