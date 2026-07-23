"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name.trim()) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setName("");
    setDescription("");
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge className="mb-2">Projects</Badge>
        <h1 className="text-2xl font-semibold text-white">Project management</h1>
        <p className="text-sm text-zinc-400">
          Organize application workspaces for the coding agent.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Create project
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={create}>Create</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-cyan-300" />
                {p.name}
              </CardTitle>
              <CardDescription>
                {p.description || "No description"} · {formatDate(p.updatedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {p.files.length} files
              </span>
              <Link href="/code">
                <Button size="sm" variant="secondary">
                  Open in code
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {!projects.length && (
          <p className="text-sm text-zinc-500">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
