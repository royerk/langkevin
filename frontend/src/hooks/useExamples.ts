import { useState, useEffect, useCallback, useRef } from "react";
import type { Example } from "../types/api";
import { fetchExamples } from "../lib/api";

const DEFAULT_PAGE_SIZE = 20;

interface UseExamples {
  examples: Example[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useExamples(datasetId: string | null): UseExamples {
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  // Track previous datasetId to reset page on change
  const prevDatasetId = useRef(datasetId);

  const load = useCallback(async () => {
    if (!datasetId) {
      setExamples([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * pageSize;
      const data = await fetchExamples(datasetId, { limit: pageSize, offset });
      setExamples(data.examples);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load examples");
    } finally {
      setLoading(false);
    }
  }, [datasetId, page, pageSize]);

  // Reset to page 1 when datasetId changes
  useEffect(() => {
    if (datasetId !== prevDatasetId.current) {
      setPage(1);
      prevDatasetId.current = datasetId;
    }
  }, [datasetId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to page 1 when changing page size
  }, []);

  return {
    examples,
    loading,
    error,
    refetch: load,
    page,
    pageSize,
    total,
    setPage,
    setPageSize: handleSetPageSize,
  };
}
