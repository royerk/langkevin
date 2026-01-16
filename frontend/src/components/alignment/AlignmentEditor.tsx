import { useState, useCallback } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import type { Message, Dataset, ScoreConfig } from "../../types/api";
import { useFeedback } from "../../hooks/useFeedback";
import { useEvaluation } from "../../hooks/useEvaluation";
import { PromptEditor } from "./PromptEditor";
import { AlignmentTable } from "./AlignmentTable";
import { Button } from "../ui/Button";
import { inferScoreConfig } from "../../lib/scoreConfig";

interface AlignmentEditorProps {
  dataset: Dataset;
  onBack: () => void;
}

const DEFAULT_MESSAGES: Message[] = [
  {
    role: "system",
    content:
      "You are an evaluator. Assess the quality of the assistant's response to the user's query. Output a score from 1-5 where 5 is excellent.",
  },
  {
    role: "user",
    content: `Query: {{inputs.query}}

Response: {{outputs.response}}

Provide your score (1-5) and reasoning.`,
  },
];

export function AlignmentEditor({ dataset, onBack }: AlignmentEditorProps) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [model, setModel] = useState("gpt-4o-mini");
  const [targetFeedbackKey, setTargetFeedbackKey] = useState<string | null>(null);
  const [scoreConfig, setScoreConfig] = useState<ScoreConfig>({ type: "continuous", min: 1, max: 5 });

  const {
    examples,
    feedbackKeys,
    loading: feedbackLoading,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useFeedback(dataset.id);

  const { results, running, progress, run, clear } = useEvaluation();

  const handleSelectTarget = useCallback(
    (key: string) => {
      setTargetFeedbackKey(key);
      // Auto-infer score config when target column changes
      if (examples.length > 0) {
        const inferredConfig = inferScoreConfig(examples, key);
        setScoreConfig(inferredConfig);
      }
    },
    [examples]
  );

  const handleRun = async () => {
    clear();
    await run(messages, model, examples, scoreConfig);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{dataset.name}</h2>
          {dataset.description && (
            <p className="text-sm text-gray-600">{dataset.description}</p>
          )}
        </div>
      </div>

      {/* Resizable panels */}
      <PanelGroup direction="vertical" className="flex-1">
        <Panel defaultSize={40} minSize={20}>
          <div className="h-full p-4 overflow-hidden">
            <PromptEditor
              messages={messages}
              model={model}
              onMessagesChange={setMessages}
              onModelChange={setModel}
              onRun={handleRun}
              running={running}
              progress={progress}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="h-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-row-resize flex items-center justify-center border-y border-gray-200">
          <div className="w-8 h-1 bg-gray-400 rounded" />
        </PanelResizeHandle>
        <Panel defaultSize={60} minSize={30}>
          <AlignmentTable
            examples={examples}
            feedbackKeys={feedbackKeys}
            targetFeedbackKey={targetFeedbackKey}
            onSelectTarget={handleSelectTarget}
            scoreConfig={scoreConfig}
            onScoreConfigChange={setScoreConfig}
            results={results}
            loading={feedbackLoading}
            error={feedbackError}
            onRetry={refetchFeedback}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
