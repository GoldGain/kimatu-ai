import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, listProjects } from "@/lib/db/memory-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const project = createProject(parsed.data.name, parsed.data.description);
  return NextResponse.json({ project }, { status: 201 });
}
