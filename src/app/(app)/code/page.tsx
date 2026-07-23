"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCode2, FolderTree, Play, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/types";

export default function CodeWorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filePath, setFilePath] = useState("src/index.ts");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [terminal, setTerminal] = useState<string[]>([
    "Kimatu Code Workspace ready.",
    "Create a project to begin.",
  ]);

  const active = useMemo(
    () => projects.find((p) => p.id === activeId) || null,
    [projects, activeId]
  );

  async function refresh() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects || []);
    if (!activeId && data.projects?.[0]) {
      setActiveId(data.projects[0].id);
      const f = data.projects[0].files[0];
      if (f) {
        setFilePath(f.path);
        setContent(f.content);
      }
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) return;
    const file = active.files.find((f) => f.path === filePath) || active.files[0];
    if (file) {
      setFilePath(file.path);
      setContent(file.content);
    }
  }, [active, filePath]);

  async function createProject() {
    if (!name.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setName("");
    setTerminal((t) => [...t, `Created project ${data.project.name}`]);
    await refresh();
    setActiveId(data.project.id);
  }

  function runPreview() {
    setTerminal((t) => [
      ...t,
      `$ kimatu run ${filePath}`,
      "Preview sandbox is local-only in this MVP (no remote exec).",
      content.slice(0, 120).replace(/\n/g, " ") + (content.length > 120 ? "…" : ""),
    ]);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4 text-cyan-300" /> Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="New project"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button size="icon" onClick={createProject} aria-label="Create">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  activeId === p.id
                    ? "bg-cyan-500/15 text-cyan-100"
                    : "text-zinc-400 hover:bg-white/5"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          {active && (
            <div className="border-t border-white/10 pt-3">
              <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                Files
              </div>
              {active.files.map((f) => (
                <button
                  key={f.path}
                  onClick={() => {
                    setFilePath(f.path);
                    setContent(f.content);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                    filePath === f.path
                      ? "bg-white/10 text-white"
                      : "text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  {f.path}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge>Code workspace</Badge>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {active?.name || "No project selected"}
            </h1>
            <p className="text-sm text-zinc-500">{filePath}</p>
          </div>
          <Button onClick={runPreview} disabled={!active}>
            <Play className="h-4 w-4" /> Run preview
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[420px] rounded-2xl border-0 bg-[#070b12] font-mono text-[13px] leading-6"
              spellCheck={false}
              disabled={!active}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Terminal</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-xs text-emerald-300/90">
              {terminal.join("\n")}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
