import { useState, useCallback, useMemo } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import type { Message, Dataset, ScoreConfig, AlignmentDetails, ModelConfig } from "../../types/api";
import { useFeedback } from "../../hooks/useFeedback";
import { useEvaluation } from "../../hooks/useEvaluation";
import { PromptEditor } from "./PromptEditor";
import { AlignmentTable } from "./AlignmentTable";
import { ConfigPanel } from "./ConfigPanel";
import { LoadPromptModal } from "./LoadPromptModal";
import { SavePromptModal } from "./SavePromptModal";
import { Button } from "../ui/Button";
import { inferScoreConfig, checkAlignment } from "../../lib/scoreConfig";

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
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadedPromptName, setLoadedPromptName] = useState<string | null>(null);

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

  const handleLoadPrompt = useCallback((messages: Message[], modelConfig?: ModelConfig, promptName?: string) => {
    setMessages(messages);
    setLoadedPromptName(promptName ?? null);
    if (modelConfig?.model) {
      setModel(modelConfig.model);
    }
  }, []);

  const handleRun = async () => {
    clear();
    await run(messages, model, examples, scoreConfig);
  };

  // Calculate alignment stats
  const alignedCount = examples.filter((ex) => {
    const result = results.get(ex.id);
    if (!result?.response || !targetFeedbackKey) return false;
    const targetFeedback = ex.feedback[targetFeedbackKey];
    const targetScore = targetFeedback?.score ?? targetFeedback?.value;
    return checkAlignment(result.response.score, targetScore, scoreConfig);
  }).length;

  const evaluatedCount = examples.filter((ex) => results.has(ex.id)).length;

  // Calculate alignment score and details for saving
  const alignmentScore = useMemo(() => {
    if (evaluatedCount === 0) return null;
    return (alignedCount / evaluatedCount) * 100;
  }, [alignedCount, evaluatedCount]);

  const alignmentDetails = useMemo((): AlignmentDetails | null => {
    if (!targetFeedbackKey || evaluatedCount === 0) return null;
    return {
      datasetName: dataset.name,
      targetColumn: targetFeedbackKey,
      alignedCount,
      totalCount: evaluatedCount,
    };
  }, [dataset.name, targetFeedbackKey, alignedCount, evaluatedCount]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
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

      {/* Resizable panels for prompt editor and table */}
      <PanelGroup orientation="vertical" className="flex-1 min-h-0">
        {/* Top panel - Prompt Editor + Config Panel (horizontally resizable) */}
        <Panel defaultSize={40} minSize={20}>
          <PanelGroup orientation="horizontal" className="h-full border-b border-gray-200">
            {/* Left: Prompt Editor */}
            <Panel defaultSize={65} minSize={30}>
              <div className="h-full p-4 overflow-auto">
                <PromptEditor
                  messages={messages}
                  model={model}
                  onMessagesChange={setMessages}
                  onModelChange={setModel}
                  onRun={handleRun}
                  running={running}
                  progress={progress}
                  onLoadFromHub={() => setLoadModalOpen(true)}
                  onSaveToHub={() => setSaveModalOpen(true)}
                />
              </div>
            </Panel>

            {/* Vertical resize handle */}
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors" />

            {/* Right: Config Panel */}
            <Panel defaultSize={35} minSize={20}>
              <div className="h-full overflow-auto">
                <ConfigPanel
                  feedbackKeys={feedbackKeys}
                  targetFeedbackKey={targetFeedbackKey}
                  onSelectTarget={handleSelectTarget}
                  scoreConfig={scoreConfig}
                  onScoreConfigChange={setScoreConfig}
                  examples={examples}
                  alignedCount={alignedCount}
                  evaluatedCount={evaluatedCount}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors" />

        {/* Bottom panel - full width table */}
        <Panel defaultSize={60} minSize={20}>
          <div className="h-full overflow-auto">
            <AlignmentTable
              examples={examples}
              feedbackKeys={feedbackKeys}
              targetFeedbackKey={targetFeedbackKey}
              scoreConfig={scoreConfig}
              results={results}
              loading={feedbackLoading}
              error={feedbackError}
              onRetry={refetchFeedback}
            />
          </div>
        </Panel>
      </PanelGroup>

      {/* Modals */}
      <LoadPromptModal
        isOpen={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        onLoad={handleLoadPrompt}
      />
      <SavePromptModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        messages={messages}
        alignmentScore={alignmentScore}
        alignmentDetails={alignmentDetails}
        loadedPromptName={loadedPromptName}
      />
    </div>
  );
}
