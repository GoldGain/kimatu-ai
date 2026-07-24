"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Copy,
  Loader2,
  MessageSquarePlus,
  MoreHorizontal,
  Paperclip,
  Send,
  Sparkles,
  StopCircle,
  Trash2,
  User,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { AgentName, ChatMessage, Conversation } from "@/types";

const agents: { id: AgentName | "auto"; label: string; hint: string }[] = [
  { id: "auto", label: "Auto", hint: "Route intelligently" },
  { id: "orchestrator", label: "Orchestrator", hint: "Coordinate work" },
  { id: "planner", label: "Planner", hint: "Break down goals" },
  { id: "coding", label: "Coding", hint: "Write & fix code" },
  { id: "research", label: "Research", hint: "Analyze & summarize" },
  { id: "testing", label: "Testing", hint: "QA & edge cases" },
  { id: "deployment", label: "Deploy", hint: "Ship to production" },
];

const starters = [
  "Plan a production SaaS MVP with auth and billing",
  "Write a secure Next.js API route with Zod validation",
  "Research competitor features for an AI workspace",
  "Create a test plan for multi-agent chat",
];

export function ChatWorkspace({
  initialConversationId,
}: {
  initialConversationId?: string;
}) {
  const selectedAgent = useAppStore((s) => s.selectedAgent);
  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const title = useMemo(
    () => conversation?.title || "New conversation",
    [conversation?.title]
  );

  async function refreshHistory() {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not load chat history");
        return;
      }
      setHistory(data.conversations || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load chat history");
    }
  }

  async function loadOrCreate(id?: string) {
    setError(null);
    if (id) {
      const res = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        await refreshHistory();
        return;
      }
    }
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Conversation" }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create conversation");
      await refreshHistory();
      return;
    }
    setConversation(data.conversation);
    if (typeof window !== "undefined" && data.conversation?.id) {
      window.history.replaceState(null, "", `/chat/${data.conversation.id}`);
    }
    await refreshHistory();
  }

  useEffect(() => {
    loadOrCreate(initialConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, sending]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input]);

  async function onSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
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
      await refreshHistory();
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

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  function onAttach() {
    setError(null);
    setInput((v) =>
      v
        ? v
        : "Please analyze the attached document once upload is enabled. For now, paste text or code here."
    );
    taRef.current?.focus();
  }

  async function onNewChat() {
    setConversation(null);
    setInput("");
    setError(null);
    await loadOrCreate();
  }

  const empty = !conversation?.messages?.length;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101218] shadow-2xl shadow-black/40 md:h-[calc(100vh-6.5rem)]">
      {/* Conversation rail */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0f14] lg:flex">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
          <div>
            <div className="text-sm font-semibold text-white">Chats</div>
            <div className="text-[11px] text-zinc-500">DeepSeek multi-agent</div>
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={() => onNewChat()}
            title="New chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {history.map((c) => {
            const active = c.id === conversation?.id;
            return (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                )}
              >
                <div className="truncate font-medium">{c.title}</div>
                <div className="mt-0.5 text-[11px] text-zinc-600">
                  {typeof c.messageCount === "number"
                    ? c.messageCount
                    : c.messages?.length || 0}{" "}
                  messages
                </div>
              </Link>
            );
          })}
          {!history.length && (
            <div className="px-3 py-6 text-center text-xs text-zinc-600">
              No chats yet
            </div>
          )}
        </div>
      </aside>

      {/* Main chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 md:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-300 to-indigo-500">
                <Sparkles className="h-4 w-4 text-[#0b0c0f]" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white md:text-base">
                  {title}
                </h1>
                <p className="text-[11px] text-zinc-500">
                  Kimi-style workspace · live DeepSeek · Supabase memory
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {agents.map((a) => (
              <button
                key={a.id}
                title={a.hint}
                onClick={() => setSelectedAgent(a.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] transition",
                  selectedAgent === a.id
                    ? "bg-teal-400/15 text-teal-100 ring-1 ring-teal-300/30"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07]"
                )}
              >
                {a.label}
              </button>
            ))}
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete chat">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-5 md:px-8">
          {empty && (
            <div className="mx-auto flex max-w-2xl flex-col items-center px-2 pt-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-300/20 to-indigo-500/20 ring-1 ring-white/10">
                <Wand2 className="h-7 w-7 text-teal-200" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                What should we work on?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
                Kimatu routes your request to planner, coding, research, testing,
                or deployment agents — then answers with production-ready detail.
              </p>
              <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSend(s)}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-teal-300/30 hover:bg-teal-400/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversation?.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "mx-auto flex w-full max-w-3xl gap-3",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role !== "user" && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300/20 to-indigo-500/20 ring-1 ring-white/10">
                  <Bot className="h-4 w-4 text-teal-200" />
                </div>
              )}
              <div
                className={cn(
                  "min-w-0 max-w-[min(720px,88%)] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-to-br from-teal-400 to-indigo-500 text-[#071018]"
                    : "border border-white/[0.08] bg-[#161922] text-zinc-100"
                )}
              >
                {m.agent && m.role === "assistant" && (
                  <Badge className="mb-2 border-teal-300/20 bg-teal-400/10 capitalize text-teal-100">
                    {m.agent} agent
                  </Badge>
                )}
                <div
                  className={cn(
                    "prose prose-sm max-w-none",
                    m.role === "user"
                      ? "prose-invert:false text-[#071018] prose-p:text-[#071018] prose-headings:text-[#071018] prose-strong:text-[#071018]"
                      : "prose-invert prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10"
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
                <div
                  className={cn(
                    "mt-2 flex items-center gap-2 text-[10px]",
                    m.role === "user" ? "text-[#071018]/70" : "text-zinc-500"
                  )}
                >
                  <span>{formatDate(m.createdAt)}</span>
                  {m.tokenUsage ? <span>· ~{m.tokenUsage} tokens</span> : null}
                  {m.role === "assistant" && (
                    <button
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 hover:bg-white/5"
                      onClick={() => copyText(m.content)}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
              {m.role === "user" && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <User className="h-4 w-4 text-zinc-100" />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-teal-300" />
              Agents are working…
            </div>
          )}
          {error && (
            <div className="mx-auto max-w-3xl rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/[0.07] bg-[#0d0f14]/90 p-3 md:p-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[28px] border border-white/[0.1] bg-[#151821] p-2 shadow-xl shadow-black/30">
              <Textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Kimatu… (Enter to send, Shift+Enter for newline)"
                className="min-h-[52px] max-h-[180px] resize-none border-0 bg-transparent px-3 py-3 text-[15px] shadow-none focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-1">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Attach"
                    onClick={onAttach}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Refresh history"
                    onClick={() => refreshHistory()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <span className="hidden text-[11px] text-zinc-600 sm:inline">
                    Agent: {selectedAgent}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {sending ? (
                    <Button variant="secondary" size="sm" disabled>
                      <StopCircle className="h-4 w-4" /> Working
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onSend()}
                      disabled={!input.trim()}
                      className="rounded-full bg-white px-4 text-[#0b0c0f] hover:bg-zinc-100"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-zinc-600">
              Kimatu can make mistakes. Verify critical code and deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
