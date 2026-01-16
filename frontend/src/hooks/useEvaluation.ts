import { useState, useCallback } from "react";
import type { Message, EvaluationResponse, ScoreConfig } from "../types/api";
import { runEvaluation } from "../lib/api";

export interface EvaluationResult {
  exampleId: string;
  response: EvaluationResponse | null;
  error: string | null;
}

interface UseEvaluation {
  results: Map<string, EvaluationResult>;
  running: boolean;
  progress: { current: number; total: number };
  run: (
    messages: Message[],
    model: string,
    examples: Array<{ id: string; inputs: Record<string, unknown>; outputs?: Record<string, unknown> }>,
    scoreConfig?: ScoreConfig
  ) => Promise<void>;
  clear: () => void;
}

export function useEvaluation(): UseEvaluation {
  const [results, setResults] = useState<Map<string, EvaluationResult>>(new Map());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const run = useCallback(
    async (
      messages: Message[],
      model: string,
      examples: Array<{ id: string; inputs: Record<string, unknown>; outputs?: Record<string, unknown> }>,
      scoreConfig?: ScoreConfig
    ) => {
      setRunning(true);
      setProgress({ current: 0, total: examples.length });
      const newResults = new Map<string, EvaluationResult>();

      for (let i = 0; i < examples.length; i++) {
        const example = examples[i];
        try {
          const response = await runEvaluation({
            messages,
            model,
            variables: {
              inputs: example.inputs,
              outputs: example.outputs ?? {},
            },
            scoreConfig,
          });
          newResults.set(example.id, {
            exampleId: example.id,
            response,
            error: null,
          });
        } catch (e) {
          newResults.set(example.id, {
            exampleId: example.id,
            response: null,
            error: e instanceof Error ? e.message : "Evaluation failed",
          });
        }
        setProgress({ current: i + 1, total: examples.length });
        setResults(new Map(newResults));
      }

      setRunning(false);
    },
    []
  );

  const clear = useCallback(() => {
    setResults(new Map());
    setProgress({ current: 0, total: 0 });
  }, []);

  return { results, running, progress, run, clear };
}
