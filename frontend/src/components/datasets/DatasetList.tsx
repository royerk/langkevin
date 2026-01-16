import type { Dataset } from "../../types/api";
import { DatasetCard } from "./DatasetCard";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { EmptyState } from "../ui/EmptyState";

interface DatasetListProps {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry?: () => void;
  hasSearchFilter?: boolean;
}

export function DatasetList({
  datasets,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
  hasSearchFilter = false,
}: DatasetListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        title={hasSearchFilter ? "No results found" : "No datasets"}
        description={
          hasSearchFilter
            ? "Try adjusting your search"
            : "Create a dataset in LangSmith to get started"
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          isSelected={selectedId === dataset.id}
          onSelect={() => onSelect(dataset.id)}
        />
      ))}
    </div>
  );
}
