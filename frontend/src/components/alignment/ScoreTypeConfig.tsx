import { useState } from "react";
import type { ScoreConfig, ExampleWithFeedback } from "../../types/api";
import {
  getUniqueValuesForColumn,
  getMinMaxForColumn,
} from "../../lib/scoreConfig";
import { Button } from "../ui/Button";

interface ScoreTypeConfigProps {
  config: ScoreConfig;
  onChange: (config: ScoreConfig) => void;
  targetFeedbackKey: string;
  examples: ExampleWithFeedback[];
}

export function ScoreTypeConfig({
  config,
  onChange,
  targetFeedbackKey,
  examples,
}: ScoreTypeConfigProps) {
  const [newCategory, setNewCategory] = useState("");

  const handleTypeChange = (type: ScoreConfig["type"]) => {
    switch (type) {
      case "boolean":
        onChange({ type: "boolean" });
        break;
      case "categories":
        onChange({ type: "categories", categories: [] });
        break;
      case "continuous":
        onChange({ type: "continuous", min: 0, max: 10 });
        break;
    }
  };

  const handlePopulateCategories = () => {
    const categories = getUniqueValuesForColumn(examples, targetFeedbackKey);
    onChange({ type: "categories", categories });
  };

  const handleInferMinMax = () => {
    const { min, max } = getMinMaxForColumn(examples, targetFeedbackKey);
    onChange({ type: "continuous", min, max });
  };

  const handleAddCategory = () => {
    if (
      config.type === "categories" &&
      newCategory.trim() &&
      !config.categories.includes(newCategory.trim())
    ) {
      onChange({
        type: "categories",
        categories: [...config.categories, newCategory.trim()],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    if (config.type === "categories") {
      onChange({
        type: "categories",
        categories: config.categories.filter((c) => c !== category),
      });
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Score Type
        </label>
        <select
          value={config.type}
          onChange={(e) =>
            handleTypeChange(e.target.value as ScoreConfig["type"])
          }
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="boolean">Boolean</option>
          <option value="categories">Categories</option>
          <option value="continuous">Continuous</option>
        </select>
      </div>

      {config.type === "categories" && (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Categories
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePopulateCategories}
              className="text-xs"
            >
              Populate from column
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {category}
                <button
                  onClick={() => handleRemoveCategory(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="Add category..."
                className="px-2 py-0.5 text-sm border border-gray-300 rounded-md w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="text-xs px-1.5"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      )}

      {config.type === "continuous" && (
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Min
            </label>
            <input
              type="number"
              value={config.min}
              onChange={(e) =>
                onChange({
                  type: "continuous",
                  min: parseInt(e.target.value) || 0,
                  max: config.max,
                })
              }
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Max
            </label>
            <input
              type="number"
              value={config.max}
              onChange={(e) =>
                onChange({
                  type: "continuous",
                  min: config.min,
                  max: parseInt(e.target.value) || 10,
                })
              }
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              &nbsp;
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInferMinMax}
              className="text-xs"
            >
              Infer from column
            </Button>
          </div>
        </div>
      )}

      {config.type === "boolean" && (
        <div className="flex items-center text-sm text-gray-600">
          Output will be <code className="mx-1 px-1 bg-gray-200 rounded">true</code> or <code className="mx-1 px-1 bg-gray-200 rounded">false</code>
        </div>
      )}
    </div>
  );
}
