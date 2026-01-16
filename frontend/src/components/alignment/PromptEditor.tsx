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
  onLoadFromHub: () => void;
  onSaveToHub: () => void;
}

export function PromptEditor({
  messages,
  model,
  onMessagesChange,
  onModelChange,
  onRun,
  running,
  progress,
  onLoadFromHub,
  onSaveToHub,
}: PromptEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Prompt Editor
          </h3>
          <Button variant="ghost" size="sm" onClick={onLoadFromHub}>
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Load
          </Button>
          <Button variant="ghost" size="sm" onClick={onSaveToHub}>
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save
          </Button>
        </div>
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
