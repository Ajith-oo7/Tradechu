import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationList } from "@/components/messages/ConversationList";
import { conversations } from "@/data/mock";

export default function MessagesPage() {
  return (
    <PageTransition>
      <PageHeader title="Messages" />
      <div className="px-4 pb-4">
        <ConversationList conversations={conversations} />
      </div>
    </PageTransition>
  );
}
