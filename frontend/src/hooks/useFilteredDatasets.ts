import { useState, useMemo, useEffect } from "react";
import type { Dataset } from "../types/api";

interface UseFilteredDatasetsResult {
  filteredDatasets: Dataset[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasSearchFilter: boolean;
}

export function useFilteredDatasets(datasets: Dataset[]): UseFilteredDatasetsResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredDatasets = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();

    // Filter by search query (case-insensitive match on name and description)
    const filtered = query
      ? datasets.filter(
          (dataset) =>
            dataset.name.toLowerCase().includes(query) ||
            dataset.description?.toLowerCase().includes(query)
        )
      : datasets;

    // Sort by modified_at descending (most recent first)
    return [...filtered].sort(
      (a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
    );
  }, [datasets, debouncedQuery]);

  return {
    filteredDatasets,
    searchQuery,
    setSearchQuery,
    hasSearchFilter: debouncedQuery.trim().length > 0,
  };
}
