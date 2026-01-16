import { useState, useEffect } from "react";
import { fetchModels } from "../../lib/api";

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

const MODEL_GROUPS: Record<string, string[]> = {
  OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  Anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
  ],
  Google: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
};

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels()
      .then(setAvailableModels)
      .catch(() => setAvailableModels([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <select
        disabled
        className="bg-gray-700 text-gray-400 text-sm rounded-lg px-3 py-2 border border-gray-600"
      >
        <option>Loading models...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
    >
      {Object.entries(MODEL_GROUPS).map(([provider, models]) => (
        <optgroup key={provider} label={provider}>
          {models
            .filter((m) => availableModels.includes(m))
            .map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
