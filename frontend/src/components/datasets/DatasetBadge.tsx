interface DatasetBadgeProps {
  type: "kv" | "llm" | "chat";
}

const badgeStyles = {
  kv: "bg-emerald-100 text-emerald-700",
  llm: "bg-purple-100 text-purple-700",
  chat: "bg-blue-100 text-blue-700",
};

const badgeLabels = {
  kv: "KV",
  llm: "LLM",
  chat: "Chat",
};

export function DatasetBadge({ type }: DatasetBadgeProps) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[type]}`}
    >
      {badgeLabels[type]}
    </span>
  );
}
