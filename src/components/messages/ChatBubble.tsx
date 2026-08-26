"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: {
    id: string;
    sender: "me" | "them";
    text: string;
    timestamp: string;
  };
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isMe
            ? "bg-pikachu text-slate-deep rounded-br-md"
            : "glass-card rounded-bl-md"
        )}
      >
        <p className="text-sm">{message.text}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isMe ? "text-slate-deep/50" : "text-white/30"
          )}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
