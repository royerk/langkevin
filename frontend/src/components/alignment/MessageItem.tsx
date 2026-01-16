import type { Message } from "../../types/api";

interface MessageItemProps {
  message: Message;
  index: number;
  onChange: (index: number, message: Message) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

const ROLES: Message["role"][] = ["system", "user", "assistant"];

export function MessageItem({
  message,
  index,
  onChange,
  onDelete,
  canDelete,
}: MessageItemProps) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800/50 px-3 py-2">
        <select
          value={message.role}
          onChange={(e) =>
            onChange(index, { ...message, role: e.target.value as Message["role"] })
          }
          className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
        {canDelete && (
          <button
            onClick={() => onDelete(index)}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Delete message"
          >
            <svg
              className="w-4 h-4"
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
        )}
      </div>
      <textarea
        value={message.content}
        onChange={(e) => onChange(index, { ...message, content: e.target.value })}
        placeholder={`Enter ${message.role} message... Use {{inputs.field}} or {{outputs.field}} for variables`}
        className="w-full bg-gray-900 text-gray-100 text-sm p-3 min-h-[100px] resize-y focus:outline-none placeholder:text-gray-600"
        rows={4}
      />
    </div>
  );
}
