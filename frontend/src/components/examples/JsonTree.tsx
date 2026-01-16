import { useState } from "react";

interface JsonTreeProps {
  data: unknown;
  defaultExpanded?: boolean;
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  defaultExpanded: boolean;
}

function JsonNode({ keyName, value, depth, defaultExpanded }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const indent = depth * 16;

  // Render primitive values
  if (value === null) {
    return (
      <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
        {keyName && <span className="text-gray-600">{keyName}: </span>}
        <span className="text-gray-400 italic">null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
        {keyName && <span className="text-gray-600">{keyName}: </span>}
        <span className="text-purple-600">{value ? "true" : "false"}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
        {keyName && <span className="text-gray-600">{keyName}: </span>}
        <span className="text-blue-600">{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    const isMultiline = value.includes("\n");
    const displayValue = isMultiline ? value.split("\n")[0] + "..." : value;
    const shouldTruncate = value.length > 100;

    return (
      <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
        {keyName && <span className="text-gray-600">{keyName}: </span>}
        <span className="text-emerald-600">
          "{shouldTruncate ? displayValue.slice(0, 100) + "..." : displayValue}"
        </span>
      </div>
    );
  }

  // Render arrays
  if (Array.isArray(value)) {
    const isEmpty = value.length === 0;

    if (isEmpty) {
      return (
        <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
          {keyName && <span className="text-gray-600">{keyName}: </span>}
          <span className="text-gray-500">[]</span>
        </div>
      );
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ paddingLeft: indent }}
          className="font-mono text-sm py-0.5 w-full text-left hover:bg-gray-100 rounded flex items-center gap-1"
        >
          <span className="text-gray-500 w-4 text-center">
            {isExpanded ? "▼" : "▶"}
          </span>
          {keyName && <span className="text-gray-600">{keyName}: </span>}
          <span className="text-gray-500">
            {isExpanded ? "[" : `[${value.length} items]`}
          </span>
        </button>
        {isExpanded && (
          <>
            {value.map((item, index) => (
              <JsonNode
                key={index}
                keyName={String(index)}
                value={item}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
            <div
              style={{ paddingLeft: indent }}
              className="font-mono text-sm text-gray-500 py-0.5 pl-5"
            >
              ]
            </div>
          </>
        )}
      </div>
    );
  }

  // Render objects
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const isEmpty = entries.length === 0;

    if (isEmpty) {
      return (
        <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
          {keyName && <span className="text-gray-600">{keyName}: </span>}
          <span className="text-gray-500">{"{}"}</span>
        </div>
      );
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ paddingLeft: indent }}
          className="font-mono text-sm py-0.5 w-full text-left hover:bg-gray-100 rounded flex items-center gap-1"
        >
          <span className="text-gray-500 w-4 text-center">
            {isExpanded ? "▼" : "▶"}
          </span>
          {keyName && <span className="text-gray-600">{keyName}: </span>}
          <span className="text-gray-500">
            {isExpanded ? "{" : `{${entries.length} keys}`}
          </span>
        </button>
        {isExpanded && (
          <>
            {entries.map(([key, val]) => (
              <JsonNode
                key={key}
                keyName={key}
                value={val}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
            <div
              style={{ paddingLeft: indent }}
              className="font-mono text-sm text-gray-500 py-0.5 pl-5"
            >
              {"}"}
            </div>
          </>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ paddingLeft: indent }} className="font-mono text-sm py-0.5">
      {keyName && <span className="text-gray-600">{keyName}: </span>}
      <span className="text-gray-700">{String(value)}</span>
    </div>
  );
}

export function JsonTree({ data, defaultExpanded = true }: JsonTreeProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">
      <JsonNode value={data} depth={0} defaultExpanded={defaultExpanded} />
    </div>
  );
}
