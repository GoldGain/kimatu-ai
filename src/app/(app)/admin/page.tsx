import { Badge } from "@/components/ui/badge";
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
  listProjects,
} from "@/lib/db/memory-store";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const usage = getUsageStats();
  const conversations = listConversations();
  const projects = listProjects();
  const plugins = listPlugins();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge className="mb-2">Admin</Badge>
        <h1 className="text-2xl font-semibold text-white">System overview</h1>
        <p className="text-sm text-zinc-400">
          Local MVP metrics. Wire Supabase RLS + auth for multi-tenant admin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Conversations</CardDescription>
            <CardTitle className="text-3xl">{usage.conversations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Messages</CardDescription>
            <CardTitle className="text-3xl">{usage.messages}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Projects</CardDescription>
            <CardTitle className="text-3xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Credits remaining</CardDescription>
            <CardTitle className="text-3xl">{usage.creditsRemaining}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
            <CardDescription>Integration health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <div className="flex justify-between">
              <span>DeepSeek</span>
              <span>
                {process.env.DEEPSEEK_API_KEY ? "configured" : "demo mode"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Supabase</span>
              <span>{isSupabaseConfigured() ? "configured" : "not set"}</span>
            </div>
            <div className="flex justify-between">
              <span>Model</span>
              <span>{process.env.DEEPSEEK_MODEL || "deepseek-chat"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plugins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plugins.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm text-zinc-300"
              >
                <span>{p.name}</span>
                <span className="text-xs text-zinc-500">
                  {p.enabled ? "on" : "off"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent conversation titles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          {conversations.slice(0, 8).map((c) => (
            <div key={c.id} className="truncate">
              {c.title}
            </div>
          ))}
          {!conversations.length && <p>No activity yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
