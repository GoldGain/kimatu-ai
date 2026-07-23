import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createConversation, listConversations } from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    assertProductionConfig();
    const conversations = await listConversations();
    return NextResponse.json({ conversations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list conversations";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    assertProductionConfig();
    const json = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const conversation = await createConversation(parsed.data.title);
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create conversation";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
