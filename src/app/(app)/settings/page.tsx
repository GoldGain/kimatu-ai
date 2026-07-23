import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isDeepSeekConfigured,
  isSupabaseConfigured,
} from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const deepseek = isDeepSeekConfigured();
  const supabase = isSupabaseConfigured();
  const serviceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const github = Boolean(process.env.GITHUB_TOKEN);
  const vercel = Boolean(process.env.VERCEL_TOKEN);

  const rows = [
    {
      name: "DeepSeek API",
      env: "DEEPSEEK_API_KEY",
      ok: deepseek,
      help: "Required. Production chat engine (OpenAI-compatible).",
    },
    {
      name: "Supabase URL + keys",
      env: "NEXT_PUBLIC_SUPABASE_URL + ANON + SERVICE_ROLE",
      ok: supabase && serviceRole,
      help: "Required. Service role is server-only for API writes.",
    },
    {
      name: "GitHub connector",
      env: "GITHUB_TOKEN",
      ok: github,
      help: "Optional fine-scoped PAT — never commit tokens.",
    },
    {
      name: "Vercel connector",
      env: "VERCEL_TOKEN",
      ok: vercel,
      help: "Optional deploy connector token.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge className="mb-2">Settings</Badge>
        <h1 className="text-2xl font-semibold text-white">Production configuration</h1>
        <p className="text-sm text-zinc-400">
          No demo mode. Missing required secrets return hard errors until configured.
          Secrets live only in environment variables.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment status</CardTitle>
          <CardDescription>
            Set values in <code className="text-cyan-300">.env.local</code> or
            your host (Vercel) project settings. Never paste keys into source.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <div className="font-medium text-zinc-100">{r.name}</div>
                <div className="text-xs text-zinc-500">{r.help}</div>
                <div className="mt-1 font-mono text-[11px] text-zinc-600">
                  {r.env}
                </div>
              </div>
              <Badge
                className={
                  r.ok
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-rose-400/20 bg-rose-400/10 text-rose-100"
                }
              >
                {r.ok ? "Configured" : "Required / missing"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase SQL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          <p>
            1. Open Supabase → SQL → New query.
          </p>
          <p>
            2. Paste and run <code className="text-cyan-300">supabase/migrations/001_init.sql</code>.
          </p>
          <p>
            3. Confirm tables: conversations, messages, projects, files, plugins, usage_tracking.
          </p>
          <p>
            4. Keep the service role key server-side only.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          <p>1. Rotate any key that was ever pasted into chat.</p>
          <p>2. Store secrets only in `.env.local` / host env panels.</p>
          <p>3. Prefer fine-scoped GitHub PATs with short expiry.</p>
          <p>4. Never ship `SUPABASE_SERVICE_ROLE_KEY` to the browser.</p>
        </CardContent>
      </Card>
    </div>
  );
}
