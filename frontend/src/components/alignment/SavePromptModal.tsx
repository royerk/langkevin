import { useState, useEffect } from "react";
import type { Message, AlignmentDetails } from "../../types/api";
import { savePrompt } from "../../lib/api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  alignmentScore: number | null;
  alignmentDetails: AlignmentDetails | null;
  loadedPromptName: string | null;
}

export function SavePromptModal({
  isOpen,
  onClose,
  messages,
  alignmentScore,
  alignmentDetails,
  loadedPromptName,
}: SavePromptModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [includeAlignment, setIncludeAlignment] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  // Auto-fill name and description when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-fill name if loaded from hub
      if (loadedPromptName) {
        setName(loadedPromptName);
      }
      // Auto-generate commit message from alignment data
      if (alignmentScore !== null && alignmentDetails) {
        setDescription(
          `${Math.round(alignmentScore)}% aligned on ${alignmentDetails.datasetName} (${alignmentDetails.targetColumn})`
        );
      }
    }
  }, [isOpen, loadedPromptName, alignmentScore, alignmentDetails]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await savePrompt({
        name: name.trim(),
        messages,
        description: description.trim() || undefined,
        alignmentScore: includeAlignment && alignmentScore !== null ? alignmentScore : undefined,
        alignmentDetails: includeAlignment && alignmentDetails ? alignmentDetails : undefined,
      });
      setSavedUrl(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save prompt");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setName("");
    setDescription("");
    setIncludeAlignment(true);
    setError(null);
    setSavedUrl(null);
    onClose();
  }

  return (
    <Modal title="Save Prompt to Hub" isOpen={isOpen} onClose={handleClose}>
      {savedUrl ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Prompt saved successfully!</p>
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 underline text-sm break-all"
            >
              {savedUrl}
            </a>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt Name {!loadedPromptName && <span className="text-red-500">*</span>}
            </label>
            {loadedPromptName ? (
              <p className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                {loadedPromptName}
              </p>
            ) : (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-evaluator-prompt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use lowercase letters, numbers, and hyphens
                </p>
              </>
            )}
          </div>

          {/* Commit Message input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commit Message
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your changes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Alignment stats */}
          {alignmentScore !== null && alignmentDetails && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Alignment Score
                </span>
                <span
                  className={`font-semibold ${
                    alignmentScore >= 80
                      ? "text-green-600"
                      : alignmentScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.round(alignmentScore)}%
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Dataset: {alignmentDetails.datasetName}</p>
                <p>Target: {alignmentDetails.targetColumn}</p>
                <p>
                  Aligned: {alignmentDetails.alignedCount}/
                  {alignmentDetails.totalCount} examples
                </p>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAlignment}
                  onChange={(e) => setIncludeAlignment(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Include alignment score in metadata
                </span>
              </label>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Prompt"
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
