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
} from "@/lib/db/repository";
import {
  isDeepSeekConfigured,
  isSupabaseConfigured,
} from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabaseOk = isSupabaseConfigured();
  const deepseekOk = isDeepSeekConfigured();

  if (!supabaseOk) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-50">
        <h1 className="text-xl font-semibold">Admin unavailable</h1>
        <p className="mt-2 text-sm">Configure Supabase production credentials first.</p>
      </div>
    );
  }

  const [usage, conversations, projects, plugins] = await Promise.all([
    getUsageStats(),
    listConversations(),
    listProjects(),
    listPlugins(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge className="mb-2">Admin</Badge>
        <h1 className="text-2xl font-semibold text-white">System overview</h1>
        <p className="text-sm text-zinc-400">
          Live metrics from Supabase. DeepSeek is required for chat inference.
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
              <span>{deepseekOk ? "live" : "missing key"}</span>
            </div>
            <div className="flex justify-between">
              <span>Supabase</span>
              <span>{supabaseOk ? "connected" : "not set"}</span>
            </div>
            <div className="flex justify-between">
              <span>Model</span>
              <span>{process.env.DEEPSEEK_MODEL || "deepseek-chat"}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span>production</span>
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
