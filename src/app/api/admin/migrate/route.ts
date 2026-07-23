import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

export const runtime = "nodejs";

/**
 * Applies supabase/migrations/001_init.sql using the service role.
 * Protected by MIGRATE_SECRET header. Prefer running SQL in Supabase SQL editor.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MIGRATE_SECRET;
    if (!secret) {
      return NextResponse.json(
        {
          error:
            "MIGRATE_SECRET is not configured. Run SQL manually in Supabase SQL editor, or set MIGRATE_SECRET.",
        },
        { status: 503 }
      );
    }

    const provided =
      req.headers.get("x-migrate-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sqlPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "001_init.sql"
    );
    const sql = await readFile(sqlPath, "utf8");
    const sb = getSupabaseServiceClient();

    // Prefer RPC if created; otherwise instruct manual run.
    const { error } = await sb.rpc("exec_sql", { query: sql });
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Automatic RPC exec_sql unavailable. Paste supabase/migrations/001_init.sql into the Supabase SQL editor and run it.",
          detail: error.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: true, message: "Migration applied via exec_sql." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
