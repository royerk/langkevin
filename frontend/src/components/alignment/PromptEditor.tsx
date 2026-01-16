import type { Message } from "../../types/api";
import { MessageList } from "./MessageList";
import { ModelSelector } from "./ModelSelector";
import { Button } from "../ui/Button";

interface PromptEditorProps {
  messages: Message[];
  model: string;
  onMessagesChange: (messages: Message[]) => void;
  onModelChange: (model: string) => void;
  onRun: () => void;
  running: boolean;
  progress: { current: number; total: number };
}

export function PromptEditor({
  messages,
  model,
  onMessagesChange,
  onModelChange,
  onRun,
  running,
  progress,
}: PromptEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Prompt Editor
        </h3>
        <div className="flex items-center gap-3">
          <ModelSelector value={model} onChange={onModelChange} />
          <Button onClick={onRun} disabled={running}>
            {running
              ? `Running ${progress.current}/${progress.total}...`
              : "Run Evaluation"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onChange={onMessagesChange} />
      </div>
    </div>
  );
}
