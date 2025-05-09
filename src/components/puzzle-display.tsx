"use client";

import { useState, useEffect } from "react";
import type { GeneratePuzzleOutput } from "@/ai/flows/generate-puzzle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, Eye, EyeOff, RefreshCw } from "lucide-react";

interface PuzzleDisplayProps {
  puzzleData: GeneratePuzzleOutput;
  onRegenerate: () => void;
}

export default function PuzzleDisplay({ puzzleData, onRegenerate }: PuzzleDisplayProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Reset state when puzzleData changes
  useEffect(() => {
    setShowSolution(false);
    setRevealedHints([]);
    setCurrentHintIndex(0);
  }, [puzzleData]);

  const handleShowHint = () => {
    if (puzzleData.hints && currentHintIndex < puzzleData.hints.length) {
      setRevealedHints((prev) => [...prev, puzzleData.hints![currentHintIndex]]);
      setCurrentHintIndex((prev) => prev + 1);
    }
  };

  const hasHints = puzzleData.hints && puzzleData.hints.length > 0;
  const remainingHints = hasHints ? puzzleData.hints!.length - currentHintIndex : 0;

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/50 p-6">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-primary-foreground">{puzzleData.title}</CardTitle>
          <Badge variant={
            puzzleData.difficulty.toLowerCase() === 'easy' ? 'secondary' :
            puzzleData.difficulty.toLowerCase() === 'medium' ? 'default' :
            'destructive'
          } className="capitalize text-sm px-3 py-1">
            {puzzleData.difficulty}
          </Badge>
        </div>
        {puzzleData.title !== puzzleData.puzzle.substring(0,50) && // Show description if puzzle content is not the title
          <CardDescription className="text-muted-foreground pt-1">A brain teaser for you!</CardDescription>
        }
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">The Puzzle:</h3>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
            {puzzleData.puzzle}
          </p>
        </div>

        {hasHints && (revealedHints.length > 0 || remainingHints > 0) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Hints:</h3>
            {revealedHints.length > 0 && (
              <Accordion type="multiple" className="w-full">
                {revealedHints.map((hint, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-base hover:no-underline">Hint {index + 1}</AccordionTrigger>
                    <AccordionContent className="text-base text-foreground/80 whitespace-pre-wrap">
                      {hint}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
             {remainingHints > 0 && (
              <Button onClick={handleShowHint} variant="outline" size="sm" className="mt-2">
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Hint ({remainingHints} left)
              </Button>
            )}
          </div>
        )}

        {showSolution && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Solution:</h3>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
              {puzzleData.solution}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-muted/50 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <Button onClick={() => setShowSolution(!showSolution)} variant="ghost" className="w-full sm:w-auto">
          {showSolution ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showSolution ? "Hide Solution" : "Show Solution"}
        </Button>
        <Button onClick={onRegenerate} variant="default" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Another Puzzle
        </Button>
      </CardFooter>
    </Card>
  );
}
