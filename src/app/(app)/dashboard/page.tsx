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
import { getUsageStats, listConversations, listPlugins } from "@/lib/db/memory-store";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const usage = getUsageStats();
  const recent = listConversations().slice(0, 5);
  const plugins = listPlugins().filter((p) => p.enabled).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge className="mb-2">Workspace</Badge>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Welcome to Kimatu AI
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Orchestrate agents, ship code, and connect tools from one dashboard.
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
          { label: "Plugins on", value: plugins, icon: Puzzle },
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
            <CardDescription>Pick up where you left off</CardDescription>
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
              { href: "/settings", label: "Add API keys securely" },
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
