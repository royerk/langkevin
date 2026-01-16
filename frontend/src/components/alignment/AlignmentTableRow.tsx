import { useState } from "react";
import type { ExampleWithFeedback, EvaluationResponse, ScoreConfig } from "../../types/api";
import { FeedbackCell } from "./FeedbackCell";
import { checkAlignment } from "../../lib/scoreConfig";
import { Modal } from "../ui/Modal";
import { JsonTree } from "../examples/JsonTree";

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

function truncateText(text: string | null | undefined, maxLength = 100): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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

  const [expandedCell, setExpandedCell] = useState<"input" | "output" | "reasoning" | null>(null);

  return (
    <>
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td
        className="px-3 py-2 text-sm text-gray-700 font-mono cursor-pointer hover:bg-gray-100 group"
        onClick={() => setExpandedCell("input")}
      >
        <div className="flex items-center gap-1">
          <span className="truncate">{truncateJson(example.inputs)}</span>
          <svg
            className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </div>
      </td>
      <td
        className="px-3 py-2 text-sm text-gray-700 font-mono cursor-pointer hover:bg-gray-100 group"
        onClick={() => example.outputs && setExpandedCell("output")}
      >
        {example.outputs ? (
          <div className="flex items-center gap-1">
            <span className="truncate">{truncateJson(example.outputs)}</span>
            <svg
              className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </div>
        ) : (
          "-"
        )}
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
            <span className="text-blue-600">
              {formatScore(evaluationResult.response?.score)}
            </span>
          )
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td
        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 group"
        onClick={() => evaluationResult?.response?.reasoning && setExpandedCell("reasoning")}
      >
        {evaluationResult?.response?.reasoning ? (
          <div className="flex items-center gap-1">
            <span className="truncate text-gray-700">{truncateText(evaluationResult.response.reasoning)}</span>
            <svg
              className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </div>
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

    <Modal
      title="Input"
      isOpen={expandedCell === "input"}
      onClose={() => setExpandedCell(null)}
    >
      <JsonTree data={example.inputs} defaultExpanded showFullStrings />
    </Modal>

    <Modal
      title="Output"
      isOpen={expandedCell === "output"}
      onClose={() => setExpandedCell(null)}
    >
      <JsonTree data={example.outputs} defaultExpanded showFullStrings />
    </Modal>

    <Modal
      title="Reasoning"
      isOpen={expandedCell === "reasoning"}
      onClose={() => setExpandedCell(null)}
    >
      <div className="whitespace-pre-wrap text-sm text-gray-700">
        {evaluationResult?.response?.reasoning || "No reasoning available"}
      </div>
    </Modal>
    </>
  );
}
