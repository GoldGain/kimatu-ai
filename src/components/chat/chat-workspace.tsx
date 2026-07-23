"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { AgentName, ChatMessage, Conversation } from "@/types";

const agents: { id: AgentName | "auto"; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "orchestrator", label: "Orchestrator" },
  { id: "planner", label: "Planner" },
  { id: "coding", label: "Coding" },
  { id: "research", label: "Research" },
  { id: "testing", label: "Testing" },
  { id: "deployment", label: "Deploy" },
];

export function ChatWorkspace({
  initialConversationId,
}: {
  initialConversationId?: string;
}) {
  const selectedAgent = useAppStore((s) => s.selectedAgent);
  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const title = useMemo(
    () => conversation?.title || "New conversation",
    [conversation?.title]
  );

  async function loadOrCreate(id?: string) {
    setError(null);
    if (id) {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        return;
      }
    }
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Conversation" }),
    });
    const data = await res.json();
    setConversation(data.conversation);
    if (typeof window !== "undefined" && data.conversation?.id) {
      window.history.replaceState(null, "", `/chat/${data.conversation.id}`);
    }
  }

  useEffect(() => {
    loadOrCreate(initialConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, sending]);

  async function onSend() {
    if (!input.trim() || !conversation || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    setError(null);

    const optimisticUser: ChatMessage = {
      id: `tmp_user_${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setConversation((c) =>
      c ? { ...c, messages: [...c.messages, optimisticUser] } : c
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: content,
          agent: selectedAgent === "auto" ? undefined : selectedAgent,
          stream: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setConversation(data.conversation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function onDelete() {
    if (!conversation) return;
    await fetch(`/api/conversations/${conversation.id}`, { method: "DELETE" });
    await loadOrCreate();
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f1a]/80 shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <h1 className="text-sm font-semibold text-white md:text-base">
              {title}
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Multi-agent chat · DeepSeek-compatible
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(a.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] transition",
                selectedAgent === a.id
                  ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/30"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              {a.label}
            </button>
          ))}
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
        {!conversation?.messages.length && (
          <div className="mx-auto mt-16 max-w-lg text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-400/20">
              <Bot className="h-7 w-7 text-cyan-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              What should Kimatu build or research?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Try: “Plan a SaaS MVP”, “Write a Next.js API route”, or “Design
              tests for auth”.
            </p>
          </div>
        )}

        {conversation?.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role !== "user" && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                <Bot className="h-4 w-4 text-cyan-300" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[min(720px,85%)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white"
                  : "border border-white/10 bg-white/[0.04] text-zinc-100"
              )}
            >
              {m.agent && m.role === "assistant" && (
                <Badge className="mb-2 capitalize">{m.agent} agent</Badge>
              )}
              <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
              <div className="mt-2 text-[10px] opacity-60">
                {formatDate(m.createdAt)}
                {m.tokenUsage ? ` · ~${m.tokenUsage} tokens` : ""}
              </div>
            </div>
            {m.role === "user" && (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <User className="h-4 w-4 text-zinc-200" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            Agents working…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-end gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Kimatu AI…"
            className="min-h-[56px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button
            size="lg"
            onClick={onSend}
            disabled={sending || !input.trim()}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
