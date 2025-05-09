// src/components/puzzle-display.tsx
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import type { GeneratePuzzleOutput } from "@/ai/flows/generate-puzzle";
import type { CheckAnswerOutput } from "@/ai/flows/check-answer-flow";
import { handleCheckAnswerAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle, HelpCircle, Loader2, Send } from "lucide-react";

interface PuzzleDisplayProps {
  puzzleData: GeneratePuzzleOutput;
  onRegenerate: () => void;
}

export default function PuzzleDisplay({ puzzleData, onRegenerate }: PuzzleDisplayProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<CheckAnswerOutput | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // Reset state when puzzleData changes
  useEffect(() => {
    setShowSolution(false);
    setRevealedHints([]);
    setCurrentHintIndex(0);
    setUserAnswer("");
    setAnswerFeedback(null);
    setIsCheckingAnswer(false);
    setAnswerError(null);
  }, [puzzleData]);

  const handleShowHint = () => {
    if (puzzleData.hints && currentHintIndex < puzzleData.hints.length) {
      setRevealedHints((prev) => [...prev, puzzleData.hints![currentHintIndex]]);
      setCurrentHintIndex((prev) => prev + 1);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) {
      setAnswerError("Please enter your answer.");
      return;
    }
    setIsCheckingAnswer(true);
    setAnswerFeedback(null);
    setAnswerError(null);
    try {
      const result = await handleCheckAnswerAction({
        originalPuzzle: puzzleData.puzzle,
        originalSolution: puzzleData.solution,
        userAnswer: userAnswer,
        puzzleType: puzzleData.title.includes("Riddle") ? "Riddle" : undefined, // Basic type inference
        difficulty: puzzleData.difficulty,
      });
      if ("error" in result) {
        setAnswerError(result.error);
      } else {
        setAnswerFeedback(result);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setAnswerError(errorMessage);
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const hasHints = puzzleData.hints && puzzleData.hints.length > 0;
  const remainingHints = hasHints ? puzzleData.hints!.length - currentHintIndex : 0;

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'secondary';
      case 'medium': return 'default';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getFeedbackAlertVariant = () => {
    if (!answerFeedback) return "default";
    if (answerFeedback.isCorrect) return "default"; // Will style with success colors
    if (answerFeedback.isPartiallyCorrect) return "default"; // Will style with warning colors
    return "destructive";
  };

  const getFeedbackAlertIcon = () => {
    if (!answerFeedback) return <HelpCircle className="h-5 w-5" />;
    if (answerFeedback.isCorrect) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (answerFeedback.isPartiallyCorrect) return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };
  
  const getFeedbackAlertTitle = () => {
    if (!answerFeedback) return "Feedback";
    if (answerFeedback.isCorrect) return "Correct!";
    if (answerFeedback.isPartiallyCorrect) return "Almost There!";
    return "Not Quite";
  };


  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden border border-border/60">
      <CardHeader className="bg-card p-6">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-3xl font-semibold text-primary">{puzzleData.title}</CardTitle>
          <Badge 
            variant={getDifficultyBadgeVariant(puzzleData.difficulty)} 
            className="capitalize text-sm px-3 py-1.5 rounded-full shrink-0"
          >
            {puzzleData.difficulty}
          </Badge>
        </div>
        {puzzleData.title !== puzzleData.puzzle.substring(0,50) && 
          <CardDescription className="text-muted-foreground pt-1 text-base">
            Engage your mind with this {puzzleData.difficulty.toLowerCase()} brain teaser!
          </CardDescription>
        }
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">The Puzzle:</h3>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg bg-muted/30 p-4 rounded-md shadow-sm">
            {puzzleData.puzzle}
          </p>
        </div>

        {/* Answer Submission Section */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h3 className="text-xl font-semibold text-foreground">Your Answer:</h3>
          <Textarea
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUserAnswer(e.target.value)}
            className="min-h-[100px] text-base focus:ring-primary focus:border-primary shadow-sm"
            disabled={isCheckingAnswer}
          />
          <Button 
            onClick={handleAnswerSubmit} 
            disabled={isCheckingAnswer || !userAnswer.trim()}
            className="w-full sm:w-auto text-base py-3 px-6"
          >
            {isCheckingAnswer ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            Check My Answer
          </Button>
          {answerError && !isCheckingAnswer && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Error Checking Answer</AlertTitle>
              <AlertDescription>{answerError}</AlertDescription>
            </Alert>
          )}
          {answerFeedback && !isCheckingAnswer && (
             <Alert 
                variant={getFeedbackAlertVariant()} 
                className={`mt-4 ${answerFeedback.isCorrect ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700' 
                    : answerFeedback.isPartiallyCorrect ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700' 
                    : 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700'}`}
            >
              {getFeedbackAlertIcon()}
              <AlertTitle className={
                  answerFeedback.isCorrect ? 'text-green-700 dark:text-green-300' :
                  answerFeedback.isPartiallyCorrect ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-red-700 dark:text-red-300'
              }>
                {getFeedbackAlertTitle()}
              </AlertTitle>
              <AlertDescription className={
                 answerFeedback.isCorrect ? 'text-green-600 dark:text-green-400' :
                 answerFeedback.isPartiallyCorrect ? 'text-yellow-600 dark:text-yellow-400' :
                 'text-red-600 dark:text-red-400'
              }>
                {answerFeedback.feedback}
                {answerFeedback.confidenceScore && (
                    <p className="text-xs opacity-70 mt-1">
                        (Confidence: {Math.round(answerFeedback.confidenceScore * 100)}%)
                    </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Hints Section */}
        {hasHints && (revealedHints.length > 0 || remainingHints > 0) && (
          <div className="space-y-4 pt-6 border-t border-border/60">
            <h3 className="text-xl font-semibold text-foreground">Hints:</h3>
            {revealedHints.length > 0 && (
              <Accordion type="multiple" className="w-full space-y-2">
                {revealedHints.map((hint, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="bg-muted/30 rounded-md shadow-sm border-border/50">
                    <AccordionTrigger className="text-lg hover:no-underline px-4 py-3">Hint {index + 1}</AccordionTrigger>
                    <AccordionContent className="text-base text-foreground/80 whitespace-pre-wrap px-4 pb-3 pt-1">
                      {hint}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
             {remainingHints > 0 && (
              <Button onClick={handleShowHint} variant="outline" size="lg" className="mt-2 text-base">
                <Lightbulb className="mr-2 h-5 w-5" />
                Get Hint ({remainingHints} available)
              </Button>
            )}
          </div>
        )}

        {/* Solution Section */}
        {showSolution && (
          <div className="space-y-4 pt-6 border-t border-border/60">
            <h3 className="text-xl font-semibold text-foreground">Solution:</h3>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-md shadow-sm border border-green-300 dark:border-green-700">
              {puzzleData.solution}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-muted/20 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 border-t border-border/60">
        <Button onClick={() => setShowSolution(!showSolution)} variant="outline" size="lg" className="w-full sm:w-auto text-base">
          {showSolution ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
          {showSolution ? "Hide Solution" : "Show Solution"}
        </Button>
        <Button onClick={onRegenerate} variant="default" size="lg" className="w-full sm:w-auto text-base">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Another Puzzle
        </Button>
      </CardFooter>
    </Card>
  );
}
