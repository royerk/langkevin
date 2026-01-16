import { useState, useEffect, useCallback } from "react";
import type { Example } from "../types/api";
import { fetchExamples } from "../lib/api";

interface UseExamples {
  examples: Example[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExamples(datasetId: string | null): UseExamples {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!datasetId) {
      setExamples([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExamples(datasetId);
      setExamples(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load examples");
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    load();
  }, [load]);

  return { examples, loading, error, refetch: load };
}
