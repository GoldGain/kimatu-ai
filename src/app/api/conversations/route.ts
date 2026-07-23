import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createConversation, listConversations } from "@/lib/db/memory-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ conversations: listConversations() });
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const conversation = createConversation(parsed.data.title);
  return NextResponse.json({ conversation }, { status: 201 });
}
