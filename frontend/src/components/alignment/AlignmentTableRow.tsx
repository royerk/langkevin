import type { ExampleWithFeedback, EvaluationResponse, ScoreConfig } from "../../types/api";
import { FeedbackCell } from "./FeedbackCell";
import { checkAlignment } from "../../lib/scoreConfig";

interface AlignmentTableRowProps {
  example: ExampleWithFeedback;
  feedbackKeys: string[];
  targetFeedbackKey: string | null;
  evaluationResult: { response: EvaluationResponse | null; error: string | null } | null;
  scoreConfig: ScoreConfig;
}

function truncateJson(obj: unknown, maxLength = 50): string {
  const str = JSON.stringify(obj);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

function formatScore(score: number | boolean | string | null | undefined): string {
  if (score === null || score === undefined) return "-";
  if (typeof score === "boolean") return score ? "true" : "false";
  return String(score);
}

export function AlignmentTableRow({
  example,
  feedbackKeys,
  targetFeedbackKey,
  evaluationResult,
  scoreConfig,
}: AlignmentTableRowProps) {
  const targetFeedback = targetFeedbackKey
    ? example.feedback[targetFeedbackKey]
    : null;
  const targetScore = targetFeedback?.score ?? targetFeedback?.value;
  const evalScore = evaluationResult?.response?.score;

  const isAligned =
    evalScore !== null &&
    evalScore !== undefined &&
    checkAlignment(evalScore, targetScore, scoreConfig);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-700 font-mono" title={JSON.stringify(example.inputs, null, 2)}>
        {truncateJson(example.inputs)}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 font-mono" title={JSON.stringify(example.outputs, null, 2)}>
        {example.outputs ? truncateJson(example.outputs) : "-"}
      </td>
      {feedbackKeys.map((key) => (
        <FeedbackCell
          key={key}
          feedback={example.feedback[key]}
          isTarget={targetFeedbackKey === key}
        />
      ))}
      <td className="px-3 py-2 text-sm">
        {evaluationResult ? (
          evaluationResult.error ? (
            <span className="text-red-600" title={evaluationResult.error}>
              Error
            </span>
          ) : (
            <span
              className="text-blue-600 cursor-help"
              title={evaluationResult.response?.reasoning || evaluationResult.response?.raw}
            >
              {formatScore(evaluationResult.response?.score)}
            </span>
          )
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-3 py-2 text-center">
        {evaluationResult && targetFeedbackKey ? (
          isAligned ? (
            <span className="text-emerald-600" title="Aligned">
              <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          ) : (
            <span className="text-red-600" title="Not aligned">
              <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
}
