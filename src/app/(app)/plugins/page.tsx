import { Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPlugins } from "@/lib/db/repository";
import { connectors } from "@/lib/connectors";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export default async function PluginsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-50">
        Configure Supabase to load the plugin registry.
      </div>
    );
  }

  const plugins = await listPlugins();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge className="mb-2">Marketplace</Badge>
        <h1 className="text-2xl font-semibold text-white">Plugins & connectors</h1>
        <p className="text-sm text-zinc-400">
          Extend Kimatu with GitHub, Supabase, Vercel, files, and document tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plugins.map((p) => {
          const connector = connectors.find((c) => c.id === p.id);
          const configured = connector?.isConfigured() ?? false;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Puzzle className="h-4 w-4 text-cyan-300" />
                      {p.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {p.description}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      p.enabled
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300"
                    }
                  >
                    {p.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-xs text-zinc-500">
                <span>{p.category}</span>
                <span>{configured ? "Env configured" : "Needs env setup"}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
