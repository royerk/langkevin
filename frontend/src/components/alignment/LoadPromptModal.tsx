import { useState, useEffect, useMemo } from "react";
import type { PromptSummary, PromptDetails, Message } from "../../types/api";
import { fetchPrompts, fetchPrompt } from "../../lib/api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { SearchInput } from "../ui/SearchInput";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";

interface LoadPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (messages: Message[]) => void;
}

export function LoadPromptModal({ isOpen, onClose, onLoad }: LoadPromptModalProps) {
  const [prompts, setPrompts] = useState<PromptSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptSummary | null>(null);
  const [preview, setPreview] = useState<PromptDetails | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPrompt) {
      loadPreview(selectedPrompt.name);
    } else {
      setPreview(null);
    }
  }, [selectedPrompt]);

  async function loadPrompts() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPrompts();
      setPrompts(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }

  async function loadPreview(name: string) {
    setLoadingPreview(true);
    try {
      const result = await fetchPrompt(name);
      setPreview(result);
    } catch {
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  const filteredPrompts = useMemo(() => {
    if (!search) return prompts;
    const lower = search.toLowerCase();
    return prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }, [prompts, search]);

  function handleLoad() {
    if (preview) {
      onLoad(preview.messages);
      handleClose();
    }
  }

  function handleClose() {
    setSelectedPrompt(null);
    setPreview(null);
    setSearch("");
    onClose();
  }

  return (
    <Modal title="Load Prompt from Hub" isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search prompts..."
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadPrompts} />
        ) : (
          <div className="flex gap-4 min-h-[300px]">
            {/* Prompt list */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {filteredPrompts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No prompts found</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredPrompts.map((prompt) => (
                      <li
                        key={prompt.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedPrompt?.id === prompt.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {prompt.name}
                        </div>
                        {prompt.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {prompt.description}
                          </p>
                        )}
                        {prompt.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {prompt.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-1.5 py-0.5 text-xs rounded ${
                                  tag.startsWith("alignment:")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Preview panel */}
            <div className="flex-1 border border-gray-200 rounded-lg p-3 overflow-y-auto max-h-[300px]">
              {loadingPreview ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : preview ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Messages ({preview.messages.length})
                  </h4>
                  {preview.messages.map((msg, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-50 rounded text-xs font-mono"
                    >
                      <span
                        className={`font-semibold ${
                          msg.role === "system"
                            ? "text-purple-600"
                            : msg.role === "assistant"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {msg.role}:
                      </span>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-700">
                        {msg.content.slice(0, 200)}
                        {msg.content.length > 200 && "..."}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Select a prompt to preview
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleLoad} disabled={!preview || loadingPreview}>
            Load Prompt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
