import type { ExampleWithFeedback, ScoreConfig } from "../../types/api";
import { ScoreTypeConfig } from "./ScoreTypeConfig";

interface ConfigPanelProps {
  feedbackKeys: string[];
  targetFeedbackKey: string | null;
  onSelectTarget: (key: string) => void;
  scoreConfig: ScoreConfig;
  onScoreConfigChange: (config: ScoreConfig) => void;
  examples: ExampleWithFeedback[];
  alignedCount: number;
  evaluatedCount: number;
}

export function ConfigPanel({
  feedbackKeys,
  targetFeedbackKey,
  onSelectTarget,
  scoreConfig,
  onScoreConfigChange,
  examples,
  alignedCount,
  evaluatedCount,
}: ConfigPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Configuration
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Target Column
          </label>
          <select
            value={targetFeedbackKey ?? ""}
            onChange={(e) => onSelectTarget(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>
              Select target column...
            </option>
            {feedbackKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Score Type
        </h4>
        <ScoreTypeConfig
          config={scoreConfig}
          onChange={onScoreConfigChange}
          targetFeedbackKey={targetFeedbackKey}
          examples={examples}
        />
      </div>

      {evaluatedCount > 0 && targetFeedbackKey && (
        <div className="p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Alignment Stats
          </h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-emerald-600">
              {Math.round((alignedCount / evaluatedCount) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {alignedCount} of {evaluatedCount} examples aligned
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
