import type { Example } from "../../types/api";
import { JsonTree } from "./JsonTree";

interface ExampleCardProps {
  example: Example;
  index: number;
}

export function ExampleCard({ example, index }: ExampleCardProps) {
  const hasOutputs =
    example.outputs && Object.keys(example.outputs).length > 0;

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700/50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">
          Example {index + 1}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {example.id.slice(0, 8)}...
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
            Inputs
          </h4>
          <JsonTree data={example.inputs} />
        </div>
        {hasOutputs && (
          <div>
            <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
              Outputs
            </h4>
            <JsonTree data={example.outputs} />
          </div>
        )}
      </div>
    </div>
  );
}
