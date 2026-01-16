import type { Dataset } from "../../types/api";
import { DatasetBadge } from "./DatasetBadge";

interface DatasetCardProps {
  dataset: Dataset;
  isSelected: boolean;
  onSelect: () => void;
}

export function DatasetCard({ dataset, isSelected, onSelect }: DatasetCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-150
        ${
          isSelected
            ? "bg-gray-800 border-indigo-500 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5"
            : "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white truncate">{dataset.name}</h3>
          {dataset.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {dataset.description}
            </p>
          )}
        </div>
        {dataset.data_type && <DatasetBadge type={dataset.data_type} />}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        {dataset.example_count ?? 0} example{dataset.example_count !== 1 ? "s" : ""}
      </div>
    </button>
  );
}
