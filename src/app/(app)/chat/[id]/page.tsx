import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatIdPage({ params }: { params: { id: string } }) {
  return <ChatWorkspace initialConversationId={params.id} />;
}
