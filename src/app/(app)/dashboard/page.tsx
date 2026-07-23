import Link from "next/link";
import {
  Code2,
  MessageSquare,
  Puzzle,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUsageStats,
  listConversations,
  listPlugins,
} from "@/lib/db/repository";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-50">
        <h1 className="text-xl font-semibold">Supabase required</h1>
        <p className="mt-2 text-sm text-amber-100/80">
          Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
          SUPABASE_SERVICE_ROLE_KEY, then run supabase/migrations/001_init.sql.
        </p>
        <Link href="/settings" className="mt-4 inline-block text-sm underline">
          Open settings
        </Link>
      </div>
    );
  }

  const [usage, conversations, plugins] = await Promise.all([
    getUsageStats(),
    listConversations(),
    listPlugins(),
  ]);
  const recent = conversations.slice(0, 5);
  const pluginsOn = plugins.filter((p) => p.enabled).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-2">Workspace</Badge>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Welcome to Kimatu AI
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Production multi-agent workspace powered by DeepSeek + Supabase.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button>
              <MessageSquare className="h-4 w-4" /> New chat
            </Button>
          </Link>
          <Link href="/code">
            <Button variant="secondary">
              <Code2 className="h-4 w-4" /> Code
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Conversations",
            value: usage.conversations,
            icon: MessageSquare,
          },
          { label: "Messages", value: usage.messages, icon: Sparkles },
          { label: "Tokens used", value: usage.tokensUsed, icon: Rocket },
          { label: "Plugins on", value: pluginsOn, icon: Puzzle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1">
              <CardDescription className="flex items-center gap-2">
                <stat.icon className="h-3.5 w-3.5" />
                {stat.label}
              </CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent conversations</CardTitle>
            <CardDescription>Persisted in Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!recent.length && (
              <p className="text-sm text-zinc-500">
                No chats yet. Start one to see activity here.
              </p>
            )}
            {recent.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm transition hover:bg-white/[0.05]"
              >
                <span className="truncate text-zinc-200">{c.title}</span>
                <span className="text-xs text-zinc-500">
                  {c.messages.length} msgs
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common agent workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/chat", label: "Plan a product roadmap" },
              { href: "/code", label: "Open code workspace" },
              { href: "/plugins", label: "Configure connectors" },
              { href: "/settings", label: "Review production config" },
            ].map((a) => (
              <Link key={a.href + a.label} href={a.href}>
                <div className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/5">
                  {a.label}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
