import { NextResponse } from "next/server";
import { listPlugins } from "@/lib/db/repository";
import { connectors } from "@/lib/connectors";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    assertProductionConfig();
    const plugins = await listPlugins();
    const enriched = plugins.map((p) => {
      const connector = connectors.find((c) => c.id === p.id);
      return {
        ...p,
        configured: connector?.isConfigured() ?? false,
        actions: defaultActions(p.id),
      };
    });
    return NextResponse.json({ plugins: enriched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list plugins";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

function defaultActions(id: string): string[] {
  switch (id) {
    case "github":
      return ["list_repos", "create_repo"];
    case "supabase":
      return ["list_tables", "select"];
    case "vercel":
      return ["list_projects", "list_deployments"];
    case "filesystem":
      return ["create_project", "read_project", "write_file"];
    case "pdf":
      return ["analyze_text"];
    default:
      return [];
  }
}
