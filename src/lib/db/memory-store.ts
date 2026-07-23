import { createId } from "@/lib/utils";
import type { ChatMessage, Conversation, Plugin, Project, UsageStats } from "@/types";

/**
 * Lightweight in-memory store for local/demo mode.
 * Swap for Supabase/Prisma in production (see supabase/migrations).
 */

const g = globalThis as unknown as {
  __kimatuStore?: {
    conversations: Map<string, Conversation>;
    projects: Map<string, Project>;
    plugins: Plugin[];
  };
};

function store() {
  if (!g.__kimatuStore) {
    g.__kimatuStore = {
      conversations: new Map(),
      projects: new Map(),
      plugins: [
        {
          id: "github",
          name: "GitHub Connector",
          description: "Connect repositories for code management and PRs.",
          enabled: true,
          category: "DevOps",
          icon: "github",
        },
        {
          id: "supabase",
          name: "Supabase Connector",
          description: "Query and manage Supabase Postgres data securely.",
          enabled: true,
          category: "Data",
          icon: "database",
        },
        {
          id: "vercel",
          name: "Vercel Connector",
          description: "Deploy previews and production apps to Vercel.",
          enabled: true,
          category: "Deploy",
          icon: "rocket",
        },
        {
          id: "browser",
          name: "Browser Automation",
          description: "Automate browsing for research and UI checks.",
          enabled: false,
          category: "Automation",
          icon: "globe",
        },
        {
          id: "filesystem",
          name: "File System",
          description: "Manage project files inside the workspace.",
          enabled: true,
          category: "Workspace",
          icon: "folder",
        },
        {
          id: "pdf",
          name: "PDF Analyzer",
          description: "Extract and analyze PDF document content.",
          enabled: true,
          category: "Documents",
          icon: "file-text",
        },
      ],
    };
  }
  return g.__kimatuStore;
}

export function listConversations(): Conversation[] {
  return Array.from(store().conversations.values()).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export function getConversation(id: string) {
  return store().conversations.get(id) || null;
}

export function createConversation(title = "New Conversation"): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: createId("conv"),
    title,
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  store().conversations.set(conversation.id, conversation);
  return conversation;
}

export function addMessage(
  conversationId: string,
  message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }
) {
  const conversation = store().conversations.get(conversationId);
  if (!conversation) return null;
  const full: ChatMessage = {
    id: message.id || createId("msg"),
    role: message.role,
    content: message.content,
    agent: message.agent,
    tokenUsage: message.tokenUsage,
    createdAt: new Date().toISOString(),
  };
  conversation.messages.push(full);
  if (conversation.title === "New Conversation" && message.role === "user") {
    conversation.title = message.content.slice(0, 48) || "New Conversation";
  }
  conversation.updatedAt = full.createdAt;
  store().conversations.set(conversationId, conversation);
  return full;
}

export function deleteConversation(id: string) {
  return store().conversations.delete(id);
}

export function listProjects(): Project[] {
  return Array.from(store().projects.values()).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export function createProject(name: string, description = ""): Project {
  const now = new Date().toISOString();
  const project: Project = {
    id: createId("proj"),
    name,
    description,
    files: [
      {
        path: "README.md",
        content: `# ${name}\n\nCreated in Kimatu AI Code Workspace.\n`,
        language: "markdown",
      },
      {
        path: "src/index.ts",
        content: `export function main() {\n  console.log("Hello from ${name}");\n}\n\nmain();\n`,
        language: "typescript",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  store().projects.set(project.id, project);
  return project;
}

export function getProject(id: string) {
  return store().projects.get(id) || null;
}

export function updateProjectFile(projectId: string, path: string, content: string) {
  const project = store().projects.get(projectId);
  if (!project) return null;
  const existing = project.files.find((f) => f.path === path);
  if (existing) existing.content = content;
  else project.files.push({ path, content });
  project.updatedAt = new Date().toISOString();
  store().projects.set(projectId, project);
  return project;
}

export function listPlugins() {
  return store().plugins;
}

export function togglePlugin(id: string, enabled: boolean) {
  const plugin = store().plugins.find((p) => p.id === id);
  if (!plugin) return null;
  plugin.enabled = enabled;
  return plugin;
}

export function getUsageStats(): UsageStats {
  const conversations = listConversations();
  const messages = conversations.reduce((n, c) => n + c.messages.length, 0);
  const tokensUsed = conversations.reduce(
    (n, c) => n + c.messages.reduce((m, msg) => m + (msg.tokenUsage || 0), 0),
    0
  );
  return {
    conversations: conversations.length,
    messages,
    tokensUsed,
    creditsRemaining: Math.max(0, 100000 - tokensUsed),
  };
}
