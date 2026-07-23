import { NextResponse } from "next/server";
import {
  isDeepSeekConfigured,
  isSupabaseConfigured,
} from "@/lib/db/supabase";

export const runtime = "nodejs";

export async function GET() {
  const deepseek = isDeepSeekConfigured();
  const supabase = isSupabaseConfigured();
  const ready = deepseek && supabase;

  return NextResponse.json(
    {
      ok: ready,
      service: "kimatu-ai",
      mode: "production",
      deepseekConfigured: deepseek,
      supabaseConfigured: supabase,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      time: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 }
  );
}
