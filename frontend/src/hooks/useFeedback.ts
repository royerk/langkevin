import { useState, useEffect, useCallback } from "react";
import type { ExampleWithFeedback } from "../types/api";
import { fetchFeedback } from "../lib/api";

interface UseFeedback {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFeedback(datasetId: string | null): UseFeedback {
  const [examples, setExamples] = useState<ExampleWithFeedback[]>([]);
  const [feedbackKeys, setFeedbackKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!datasetId) {
      setExamples([]);
      setFeedbackKeys([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeedback(datasetId);
      setExamples(result.examples);
      setFeedbackKeys(result.feedbackKeys);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    load();
  }, [load]);

  return { examples, feedbackKeys, loading, error, refetch: load };
}
