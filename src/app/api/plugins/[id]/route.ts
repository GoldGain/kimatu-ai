import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { togglePlugin } from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

const bodySchema = z.object({
  enabled: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const plugin = await togglePlugin(params.id, parsed.data.enabled);
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }
    return NextResponse.json({ plugin });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update plugin";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
