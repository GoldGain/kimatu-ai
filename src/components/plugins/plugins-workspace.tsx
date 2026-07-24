"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  Puzzle,
  RefreshCw,
  XCircle,
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
import type { Plugin } from "@/types";

type EnrichedPlugin = Plugin & {
  configured?: boolean;
  actions?: string[];
};

export function PluginsWorkspace() {
  const [plugins, setPlugins] = useState<EnrichedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plugins");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load plugins");
      setPlugins(data.plugins || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load plugins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onToggle(plugin: EnrichedPlugin) {
    setBusyId(plugin.id);
    setResult(null);
    try {
      const res = await fetch(`/api/plugins/${plugin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !plugin.enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Toggle failed");
      await load();
      setResult(`${plugin.name} is now ${!plugin.enabled ? "enabled" : "disabled"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onRun(plugin: EnrichedPlugin, action: string) {
    setBusyId(plugin.id + ":" + action);
    setResult(null);
    setError(null);
    try {
      const input =
        action === "select"
          ? { table: "conversations", limit: 5 }
          : action === "analyze_text"
            ? { text: "Kimatu AI production plugin smoke test." }
            : action === "create_project"
              ? { name: `Plugin run ${new Date().toISOString().slice(0, 16)}` }
              : {};
      const res = await fetch(`/api/connectors/${plugin.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, input }),
      });
      const data = await res.json();
      if (!res.ok && data.ok !== true) {
        throw new Error(data.error || data.message || "Connector failed");
      }
      setResult(
        JSON.stringify(
          {
            plugin: plugin.id,
            action,
            ok: data.ok,
            message: data.message,
            data: data.data,
          },
          null,
          2
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge className="mb-2">Marketplace</Badge>
          <h1 className="text-2xl font-semibold text-white">Plugins & connectors</h1>
          <p className="text-sm text-zinc-400">
            Enable connectors and run real actions against GitHub, Supabase, Vercel, and workspace tools.
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loading && !plugins.length ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading plugins from Supabase…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plugins.map((p) => (
            <Card key={p.id + p.name}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Puzzle className="h-4 w-4 text-teal-300" />
                      {p.name}
                    </CardTitle>
                    <CardDescription className="mt-2">{p.description}</CardDescription>
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
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{p.category}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    {p.configured ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Env configured
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-amber-300" /> Needs env setup
                      </>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId === p.id}
                    onClick={() => onToggle(p)}
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {p.enabled ? "Disable" : "Enable"}
                  </Button>
                  {(p.actions || []).slice(0, 3).map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      disabled={!p.enabled || busyId === p.id + ":" + action}
                      onClick={() => onRun(p, action)}
                    >
                      {busyId === p.id + ":" + action ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last connector result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-emerald-200/90">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
