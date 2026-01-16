import type { Feedback } from "../../types/api";

interface FeedbackCellProps {
  feedback: Feedback | undefined;
  feedbackKey: string;
  isTarget: boolean;
  onSelectTarget: (key: string) => void;
}

export function FeedbackCell({
  feedback,
  feedbackKey,
  isTarget,
  onSelectTarget,
}: FeedbackCellProps) {
  const displayValue = feedback
    ? feedback.score !== null
      ? feedback.score.toString()
      : feedback.value !== null
        ? String(feedback.value)
        : "-"
    : "-";

  return (
    <td className="px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name="targetFeedback"
          checked={isTarget}
          onChange={() => onSelectTarget(feedbackKey)}
          className="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
          title="Select as target for alignment"
        />
        <span
          className={`${feedback ? "text-gray-200" : "text-gray-500"}`}
          title={feedback?.comment ?? undefined}
        >
          {displayValue}
        </span>
      </div>
    </td>
  );
}
