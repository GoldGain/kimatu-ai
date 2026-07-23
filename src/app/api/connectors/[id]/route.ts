import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConnector } from "@/lib/connectors";
import { assertProductionConfig } from "@/lib/db/supabase";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.string().min(1),
  input: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    assertProductionConfig();
    const connector = getConnector(params.id);
    if (!connector) {
      return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    }
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const result = await connector.run(
      parsed.data.action,
      parsed.data.input || {}
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connector failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const connector = getConnector(params.id);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: connector.id,
    name: connector.name,
    description: connector.description,
    configured: connector.isConfigured(),
  });
}
