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
            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500/20 shadow-sm"
            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 truncate">{dataset.name}</h3>
          {dataset.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
