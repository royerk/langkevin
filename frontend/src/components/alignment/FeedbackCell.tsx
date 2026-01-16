import type { Feedback } from "../../types/api";

interface FeedbackCellProps {
  feedback: Feedback | undefined;
  isTarget: boolean;
}

export function FeedbackCell({ feedback, isTarget }: FeedbackCellProps) {
  const displayValue = feedback
    ? feedback.score !== null
      ? feedback.score.toString()
      : feedback.value !== null
        ? String(feedback.value)
        : "-"
    : "-";

  return (
    <td className={`px-3 py-2 text-sm ${isTarget ? "bg-blue-50" : ""}`}>
      <span
        className={feedback ? "text-gray-700" : "text-gray-400"}
        title={feedback?.comment ?? undefined}
      >
        {displayValue}
      </span>
    </td>
  );
}
