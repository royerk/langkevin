import { useState, useEffect } from "react";
import type { Dataset } from "../types/api";
import { fetchDatasets } from "../lib/api";

interface UseDatasets {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDatasets(): UseDatasets {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDatasets();
      setDatasets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { datasets, loading, error, refetch: load };
}
