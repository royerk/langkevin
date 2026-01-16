import type { ExampleWithFeedback, EvaluationResponse } from "../../types/api";
import { AlignmentTableRow } from "./AlignmentTableRow";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { EmptyState } from "../ui/EmptyState";

interface AlignmentTableProps {
  examples: ExampleWithFeedback[];
  feedbackKeys: string[];
  targetFeedbackKey: string | null;
  onSelectTarget: (key: string) => void;
  results: Map<string, { response: EvaluationResponse | null; error: string | null }>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AlignmentTable({
  examples,
  feedbackKeys,
  targetFeedbackKey,
  onSelectTarget,
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

  const alignedCount = examples.filter((ex) => {
    const result = results.get(ex.id);
    if (!result?.response || !targetFeedbackKey) return false;
    const targetFeedback = ex.feedback[targetFeedbackKey];
    const targetScore = targetFeedback?.score ?? targetFeedback?.value;
    return targetScore === result.response.score;
  }).length;

  const evaluatedCount = examples.filter((ex) => results.has(ex.id)).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Alignment Table
        </h3>
        {evaluatedCount > 0 && targetFeedbackKey && (
          <div className="text-sm text-gray-400">
            Aligned:{" "}
            <span className="text-green-400 font-medium">
              {alignedCount}/{evaluatedCount}
            </span>{" "}
            ({Math.round((alignedCount / evaluatedCount) * 100)}%)
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Input
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Output
              </th>
              {feedbackKeys.map((key) => (
                <th
                  key={key}
                  className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {key}
                </th>
              ))}
              <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Eval
              </th>
              <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide text-center">
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
                onSelectTarget={onSelectTarget}
                evaluationResult={results.get(example.id) ?? null}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
