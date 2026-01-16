interface DatasetBadgeProps {
  type: "kv" | "llm" | "chat";
}

const badgeStyles = {
  kv: "bg-emerald-500/20 text-emerald-400",
  llm: "bg-purple-500/20 text-purple-400",
  chat: "bg-blue-500/20 text-blue-400",
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
