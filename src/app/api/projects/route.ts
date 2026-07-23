import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, listProjects } from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    assertProductionConfig();
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list projects";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    assertProductionConfig();
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const project = await createProject(
      parsed.data.name,
      parsed.data.description
    );
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
