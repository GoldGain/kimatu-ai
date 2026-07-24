import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProject, updateProjectFile } from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    const project = await getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load project";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

const patchSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const project = await updateProjectFile(
      params.id,
      parsed.data.path,
      parsed.data.content
    );
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save file";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
