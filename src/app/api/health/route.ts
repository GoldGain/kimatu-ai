import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "kimatu-ai",
    deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    supabaseConfigured: isSupabaseConfigured(),
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    time: new Date().toISOString(),
  });
}
