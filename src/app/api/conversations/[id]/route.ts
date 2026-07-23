import { NextRequest, NextResponse } from "next/server";
import { deleteConversation, getConversation } from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    const conversation = await getConversation(params.id);
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load conversation";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    await deleteConversation(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete conversation";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
