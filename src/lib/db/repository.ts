import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import type {
  ChatMessage,
  Conversation,
  Plugin,
  Project,
  ProjectFile,
  UsageStats,
} from "@/types";

const DEFAULT_PLUGINS: Omit<Plugin, "id">[] = [
  {
    name: "GitHub Connector",
    description: "Connect repositories for code management and PRs.",
    enabled: true,
    category: "DevOps",
    icon: "github",
  },
  {
    name: "Supabase Connector",
    description: "Query and manage Supabase Postgres data securely.",
    enabled: true,
    category: "Data",
    icon: "database",
  },
  {
    name: "Vercel Connector",
    description: "Deploy previews and production apps to Vercel.",
    enabled: true,
    category: "Deploy",
    icon: "rocket",
  },
  {
    name: "Browser Automation",
    description: "Automate browsing for research and UI checks.",
    enabled: false,
    category: "Automation",
    icon: "globe",
  },
  {
    name: "File System",
    description: "Manage project files inside the workspace.",
    enabled: true,
    category: "Workspace",
    icon: "folder",
  },
  {
    name: "PDF Analyzer",
    description: "Extract and analyze PDF document content.",
    enabled: true,
    category: "Documents",
    icon: "file-text",
  },
];

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: String(row.id),
    role: row.role as ChatMessage["role"],
    content: String(row.content ?? ""),
    agent: (row.agent as ChatMessage["agent"]) || undefined,
    tokenUsage: Number(row.token_usage || 0) || undefined,
    createdAt: String(row.created_at),
  };
}

function mapConversation(
  row: Record<string, unknown>,
  messages: ChatMessage[] = []
): Conversation {
  return {
    id: String(row.id),
    title: String(row.title || "New Conversation"),
    model: String(row.model || process.env.DEEPSEEK_MODEL || "deepseek-chat"),
    messages,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapProject(
  row: Record<string, unknown>,
  files: ProjectFile[] = []
): Project {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : "",
    files,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPlugin(row: Record<string, unknown>): Plugin {
  const name = String(row.name || "");
  const slug = name.toLowerCase();
  let id = String(row.id);
  if (slug.includes("github")) id = "github";
  else if (slug.includes("supabase")) id = "supabase";
  else if (slug.includes("vercel")) id = "vercel";
  else if (slug.includes("browser")) id = "browser";
  else if (slug.includes("file")) id = "filesystem";
  else if (slug.includes("pdf")) id = "pdf";

  return {
    id,
    name,
    description: String(row.description || ""),
    enabled: Boolean(row.enabled),
    category: String((row.config as { category?: string } | null)?.category || "General"),
    icon: String((row.config as { icon?: string } | null)?.icon || "puzzle"),
  };
}

export async function listConversations(): Promise<Conversation[]> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => mapConversation(row));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const sb = getSupabaseServerClient();
  const { data: conv, error } = await sb
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!conv) return null;

  const { data: messages, error: msgErr } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (msgErr) throw new Error(msgErr.message);

  return mapConversation(conv, (messages || []).map(mapMessage));
}

export async function createConversation(
  title = "New Conversation"
): Promise<Conversation> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("conversations")
    .insert({
      title,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapConversation(data, []);
}

export async function addMessage(
  conversationId: string,
  message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }
): Promise<ChatMessage | null> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      agent: message.agent || null,
      token_usage: message.tokenUsage || 0,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (message.role === "user") {
    const title = message.content.slice(0, 48) || "New Conversation";
    await sb
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("title", "New Conversation");
  } else {
    await sb
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }

  return mapMessage(data);
}

export async function deleteConversation(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient();
  const { error } = await sb.from("conversations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function listProjects(): Promise<Project[]> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const projects: Project[] = [];
  for (const row of data || []) {
    const { data: files } = await sb
      .from("files")
      .select("path, content")
      .eq("project_id", row.id)
      .order("path", { ascending: true });
    projects.push(
      mapProject(
        row,
        (files || []).map((f) => ({
          path: String(f.path),
          content: String(f.content || ""),
        }))
      )
    );
  }
  return projects;
}

export async function createProject(
  name: string,
  description = ""
): Promise<Project> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("projects")
    .insert({ name, description })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const seed = [
    {
      project_id: data.id,
      path: "README.md",
      content: `# ${name}\n\nCreated in Kimatu AI Code Workspace.\n`,
    },
    {
      project_id: data.id,
      path: "src/index.ts",
      content: `export function main() {\n  console.log("Hello from ${name}");\n}\n\nmain();\n`,
    },
  ];
  const { data: files, error: fileErr } = await sb
    .from("files")
    .insert(seed)
    .select("path, content");
  if (fileErr) throw new Error(fileErr.message);

  return mapProject(
    data,
    (files || []).map((f) => ({
      path: String(f.path),
      content: String(f.content || ""),
    }))
  );
}

export async function getProject(id: string): Promise<Project | null> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { data: files } = await sb
    .from("files")
    .select("path, content")
    .eq("project_id", id)
    .order("path", { ascending: true });
  return mapProject(
    data,
    (files || []).map((f) => ({
      path: String(f.path),
      content: String(f.content || ""),
    }))
  );
}

export async function updateProjectFile(
  projectId: string,
  path: string,
  content: string
): Promise<Project | null> {
  const sb = getSupabaseServerClient();
  const { error } = await sb.from("files").upsert(
    {
      project_id: projectId,
      path,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id,path" }
  );
  if (error) throw new Error(error.message);
  await sb
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);
  return getProject(projectId);
}

export async function listPlugins(): Promise<Plugin[]> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb.from("plugins").select("*").order("name");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    // Seed once if empty
    const seed = DEFAULT_PLUGINS.map((p) => ({
      name: p.name,
      description: p.description,
      enabled: p.enabled,
      config: { category: p.category, icon: p.icon },
    }));
    const { data: inserted, error: seedErr } = await sb
      .from("plugins")
      .insert(seed)
      .select("*");
    if (seedErr) throw new Error(seedErr.message);
    return (inserted || []).map(mapPlugin);
  }
  return data.map(mapPlugin);
}

export async function togglePlugin(id: string, enabled: boolean) {
  const plugins = await listPlugins();
  const plugin = plugins.find((p) => p.id === id);
  if (!plugin) return null;
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("plugins")
    .update({ enabled })
    .eq("name", plugin.name)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapPlugin(data) : null;
}

export async function getUsageStats(): Promise<UsageStats> {
  const sb = getSupabaseServerClient();
  const { count: convCount, error: cErr } = await sb
    .from("conversations")
    .select("*", { count: "exact", head: true });
  if (cErr) throw new Error(cErr.message);

  const { count: msgCount, error: mErr } = await sb
    .from("messages")
    .select("*", { count: "exact", head: true });
  if (mErr) throw new Error(mErr.message);

  const { data: tokenRows, error: tErr } = await sb
    .from("messages")
    .select("token_usage");
  if (tErr) throw new Error(tErr.message);
  const tokensUsed = (tokenRows || []).reduce(
    (n, r) => n + Number(r.token_usage || 0),
    0
  );

  return {
    conversations: convCount || 0,
    messages: msgCount || 0,
    tokensUsed,
    creditsRemaining: Math.max(0, 100000 - tokensUsed),
  };
}

export async function recordUsage(action: string, tokenUsed: number) {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabaseServerClient();
  await sb.from("usage_tracking").insert({
    action,
    token_used: tokenUsed,
    cost: 0,
  });
}
