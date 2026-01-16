import type { Example } from "../../types/api";
import { ExampleCard } from "./ExampleCard";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { EmptyState } from "../ui/EmptyState";
import { Pagination } from "../ui/Pagination";

interface ExampleViewerProps {
  examples: Example[];
  loading: boolean;
  error: string | null;
  hasSelection: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ExampleViewer({
  examples,
  loading,
  error,
  hasSelection,
  onRetry,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ExampleViewerProps) {
  if (!hasSelection) {
    return (
      <EmptyState
        title="Select a dataset"
        description="Choose a dataset from the sidebar to view its examples"
        icon={
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (examples.length === 0) {
    return (
      <EmptyState
        title="No examples"
        description="This dataset doesn't have any examples yet"
      />
    );
  }

  // Calculate display index based on pagination
  const startIndex = (page - 1) * pageSize;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {examples.map((example, index) => (
          <ExampleCard
            key={example.id}
            example={example}
            index={startIndex + index}
          />
        ))}
      </div>
      {total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
