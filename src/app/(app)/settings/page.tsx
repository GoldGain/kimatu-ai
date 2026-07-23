import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const deepseek = Boolean(process.env.DEEPSEEK_API_KEY);
  const supabase = isSupabaseConfigured();
  const github = Boolean(process.env.GITHUB_TOKEN);
  const vercel = Boolean(process.env.VERCEL_TOKEN);

  const rows = [
    {
      name: "DeepSeek API",
      env: "DEEPSEEK_API_KEY",
      ok: deepseek,
      help: "Primary model engine (OpenAI-compatible).",
    },
    {
      name: "Supabase",
      env: "NEXT_PUBLIC_SUPABASE_URL + ANON_KEY",
      ok: supabase,
      help: "Auth, Postgres, and future RAG storage.",
    },
    {
      name: "GitHub",
      env: "GITHUB_TOKEN",
      ok: github,
      help: "Fine-scoped PAT only — never commit tokens.",
    },
    {
      name: "Vercel",
      env: "VERCEL_TOKEN",
      ok: vercel,
      help: "Optional deploy connector.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge className="mb-2">Settings</Badge>
        <h1 className="text-2xl font-semibold text-white">Configuration</h1>
        <p className="text-sm text-zinc-400">
          Secrets are read from environment variables only. Do not paste API keys
          into chat or source control.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment status</CardTitle>
          <CardDescription>
            Copy <code className="text-cyan-300">.env.example</code> to{" "}
            <code className="text-cyan-300">.env.local</code> and fill values
            locally or in Vercel project settings.
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
                    : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                }
              >
                {r.ok ? "Configured" : "Missing"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          <p>1. Rotate any key that was pasted into chat or committed.</p>
          <p>2. Store secrets only in `.env.local` / host env panels.</p>
          <p>3. Prefer fine-scoped GitHub PATs with short expiry.</p>
          <p>4. Never ship `SUPABASE_SERVICE_ROLE_KEY` to the browser.</p>
        </CardContent>
      </Card>
    </div>
  );
}
