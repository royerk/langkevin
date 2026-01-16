import type { ExampleWithFeedback, EvaluationResponse, ScoreConfig } from "../../types/api";
import { AlignmentTableRow } from "./AlignmentTableRow";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { EmptyState } from "../ui/EmptyState";

interface AlignmentTableProps {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
  targetFeedbackKey: string | null;
  scoreConfig: ScoreConfig;
  results: Map<string, { response: EvaluationResponse | null; error: string | null }>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AlignmentTable({
  examples,
  feedbackKeys,
  targetFeedbackKey,
  scoreConfig,
  results,
  loading,
  error,
  onRetry,
}: AlignmentTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState message="No examples found in this dataset" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Input
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Output
              </th>
              {feedbackKeys.map((key) => (
                <th
                  key={key}
                  className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {key}
                </th>
              ))}
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Eval
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Reasoning
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
                Aligned?
              </th>
            </tr>
          </thead>
          <tbody>
            {examples.map((example) => (
              <AlignmentTableRow
                key={example.id}
                example={example}
                feedbackKeys={feedbackKeys}
                targetFeedbackKey={targetFeedbackKey}
                evaluationResult={results.get(example.id) ?? null}
                scoreConfig={scoreConfig}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
