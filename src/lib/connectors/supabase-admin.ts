import { getSupabaseServiceClient } from "@/lib/db/supabase";

export async function runSelect(table: string, limit = 50) {
  const sb = getSupabaseServiceClient();
  const { data, error } = await sb.from(table).select("*").limit(limit);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, message: "ok", data };
}

export async function listTablesHint() {
  return {
    ok: true as const,
    message:
      "Use Supabase SQL editor or service-role queries against public tables (conversations, messages, projects, files, plugins, usage_tracking).",
  };
}
