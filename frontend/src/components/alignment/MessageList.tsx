import type { Message } from "../../types/api";
import { MessageItem } from "./MessageItem";
import { Button } from "../ui/Button";

interface MessageListProps {
  messages: Message[];
  onChange: (messages: Message[]) => void;
}

export function MessageList({ messages, onChange }: MessageListProps) {
  const handleMessageChange = (index: number, message: Message) => {
    const newMessages = [...messages];
    newMessages[index] = message;
    onChange(newMessages);
  };

  const handleDelete = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index);
    onChange(newMessages);
  };

  const handleAdd = (role: Message["role"]) => {
    onChange([...messages, { role, content: "" }]);
  };

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <MessageItem
          key={index}
          message={message}
          index={index}
          onChange={handleMessageChange}
          onDelete={handleDelete}
          canDelete={messages.length > 1}
        />
      ))}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleAdd("user")}>
          + Human
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAdd("assistant")}>
          + Assistant
        </Button>
      </div>
    </div>
  );
}
