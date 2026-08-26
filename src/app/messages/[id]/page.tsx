"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChatBubble } from "@/components/messages/ChatBubble";
import { ConversationActions } from "@/components/messages/ConversationActions";
import { TradeConfirmation } from "@/components/messages/TradeConfirmation";
import { getConversationById, chatMessages } from "@/data/mock";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params.id as string;
  const conversation = getConversationById(convId);
  const messages = chatMessages[convId] ?? [];
  const [tradeDismissed, setTradeDismissed] = useState(false);

  if (!conversation) {
    return (
      <PageTransition>
        <PageHeader title="Chat" showBack backHref="/messages" />
        <div className="text-center py-20 text-white/40">Conversation not found</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex flex-col min-h-screen">
      <PageHeader
        title={`@${conversation.username}`}
        showBack
        backHref="/messages"
        rightElement={
          <ConversationActions
            onDelete={() => {
              if (confirm("Delete this conversation?")) router.push("/messages");
            }}
            onArchive={() => alert("Conversation archived (demo)")}
            onMute={() => alert("Conversation muted (demo)")}
          />
        }
      />

      {!tradeDismissed && (
        <TradeConfirmation
          tradeGive={conversation.tradeGive}
          tradeReceive={conversation.tradeReceive}
          startedAt={conversation.startedAt}
          onDismiss={() => setTradeDismissed(true)}
        />
      )}

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none py-2"
          />
          <button className="w-9 h-9 rounded-xl bg-pikachu flex items-center justify-center active:scale-95 transition-transform">
            <Send size={16} className="text-slate-deep" />
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
