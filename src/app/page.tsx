"use client";

import { useState } from 'react';
import type { GeneratePuzzleOutput } from '@/ai/flows/generate-puzzle';
import PuzzleGeneratorForm from '@/components/puzzle-generator-form';
import PuzzleDisplay from '@/components/puzzle-display';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const [puzzleData, setPuzzleData] = useState<GeneratePuzzleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPuzzleParams, setCurrentPuzzleParams] = useState<{ puzzleType: string; difficulty: string } | null>(null);

  const handleNewPuzzleRequest = (params: { puzzleType: string; difficulty: string }) => {
    setCurrentPuzzleParams(params);
  };

  return (
    <div className="container mx-auto p-4 py-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        <PuzzleGeneratorForm
          onPuzzleGenerated={(data, params) => {
            setPuzzleData(data);
            handleNewPuzzleRequest(params);
          }}
          setIsLoading={setIsLoading}
          setError={setError}
          currentParams={currentPuzzleParams}
        />
        {isLoading && (
          <div className="flex flex-col justify-center items-center p-8 space-y-4 rounded-lg bg-card shadow-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Generating your puzzle... please wait.</p>
          </div>
        )}
        {error && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Generating Puzzle</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {puzzleData && !isLoading && !error && (
          <PuzzleDisplay
            puzzleData={puzzleData}
            onRegenerate={() => {
              if (currentPuzzleParams) {
                // This will trigger a new generation via PuzzleGeneratorForm's useEffect
                 setCurrentPuzzleParams({...currentPuzzleParams}); 
                 setPuzzleData(null); // Clear old puzzle while new one generates
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
