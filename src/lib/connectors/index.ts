import * as github from "@/lib/connectors/github";
import * as vercel from "@/lib/connectors/vercel";
import * as supabaseAdmin from "@/lib/connectors/supabase-admin";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export type ConnectorContext = {
  userId?: string;
  config?: Record<string, unknown>;
};

export type ConnectorResult = {
  ok: boolean;
  message: string;
  data?: unknown;
};

export interface Connector {
  id: string;
  name: string;
  description: string;
  isConfigured(): boolean;
  run(
    action: string,
    input?: Record<string, unknown>,
    ctx?: ConnectorContext
  ): Promise<ConnectorResult>;
}

export const githubConnector: Connector = {
  id: "github",
  name: "GitHub Connector",
  description: "Repos, files, branches, and pull requests via GitHub API.",
  isConfigured: () => Boolean(process.env.GITHUB_TOKEN),
  async run(action, input = {}) {
    switch (action) {
      case "list_repos":
        return github.listRepos();
      case "create_repo":
        return github.createRepo(
          String(input.name || ""),
          String(input.description || ""),
          Boolean(input.private)
        );
      case "get_file":
        return github.getFile(
          String(input.owner),
          String(input.repo),
          String(input.path)
        );
      case "put_file":
        return github.putFile({
          owner: String(input.owner),
          repo: String(input.repo),
          path: String(input.path),
          content: String(input.content || ""),
          message: String(input.message || "Update via Kimatu AI"),
          branch: input.branch ? String(input.branch) : undefined,
          sha: input.sha ? String(input.sha) : undefined,
        });
      case "create_branch":
        return github.createBranch(
          String(input.owner),
          String(input.repo),
          String(input.branch),
          String(input.sha)
        );
      case "create_pr":
        return github.createPullRequest({
          owner: String(input.owner),
          repo: String(input.repo),
          title: String(input.title || "Kimatu PR"),
          head: String(input.head),
          base: String(input.base || "main"),
          body: input.body ? String(input.body) : undefined,
        });
      default:
        return {
          ok: false,
          message: `Unknown GitHub action: ${action}`,
        };
    }
  },
};

export const supabaseConnector: Connector = {
  id: "supabase",
  name: "Supabase Connector",
  description: "Database operations via Supabase service role.",
  isConfigured: () => isSupabaseConfigured(),
  async run(action, input = {}) {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message:
          "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      };
    }
    switch (action) {
      case "select":
        return supabaseAdmin.runSelect(
          String(input.table || "conversations"),
          Number(input.limit || 50)
        );
      case "list_tables":
        return supabaseAdmin.listTablesHint();
      default:
        return {
          ok: false,
          message: `Unknown Supabase action: ${action}`,
        };
    }
  },
};

export const vercelConnector: Connector = {
  id: "vercel",
  name: "Vercel Connector",
  description: "List projects and deployments via Vercel API.",
  isConfigured: () => Boolean(process.env.VERCEL_TOKEN),
  async run(action, input = {}) {
    switch (action) {
      case "list_projects":
        return vercel.listProjects();
      case "list_deployments":
        return vercel.listDeployments(
          input.projectId ? String(input.projectId) : undefined
        );
      case "get_deployment":
        return vercel.getDeployment(String(input.id));
      default:
        return { ok: false, message: `Unknown Vercel action: ${action}` };
    }
  },
};

export const filesystemConnector: Connector = {
  id: "filesystem",
  name: "File System",
  description: "Virtual project file operations in Kimatu workspace DB.",
  isConfigured: () => isSupabaseConfigured(),
  async run(action, input = {}) {
    const { updateProjectFile, getProject, createProject } = await import(
      "@/lib/db/repository"
    );
    if (action === "create_project") {
      const project = await createProject(
        String(input.name || "Untitled"),
        String(input.description || "")
      );
      return { ok: true, message: "Project created", data: project };
    }
    if (action === "write_file") {
      const project = await updateProjectFile(
        String(input.projectId),
        String(input.path),
        String(input.content || "")
      );
      return {
        ok: Boolean(project),
        message: project ? "File saved" : "Project not found",
        data: project,
      };
    }
    if (action === "read_project") {
      const project = await getProject(String(input.projectId));
      return {
        ok: Boolean(project),
        message: project ? "ok" : "Not found",
        data: project,
      };
    }
    return { ok: false, message: `Unknown filesystem action: ${action}` };
  },
};

export const pdfConnector: Connector = {
  id: "pdf",
  name: "PDF Analyzer",
  description: "Extract and analyze PDF document content.",
  isConfigured: () => true,
  async run(action, input = {}) {
    if (action === "analyze_text") {
      const text = String(input.text || "");
      return {
        ok: true,
        message: "Text analysis complete",
        data: {
          chars: text.length,
          words: text.split(/\s+/).filter(Boolean).length,
          preview: text.slice(0, 500),
        },
      };
    }
    return {
      ok: false,
      message:
        "Upload binary PDF parsing can be wired with a PDF parser package; pass extracted text to analyze_text.",
    };
  },
};

export const connectors: Connector[] = [
  githubConnector,
  supabaseConnector,
  vercelConnector,
  filesystemConnector,
  pdfConnector,
];

export function getConnector(id: string) {
  return connectors.find((c) => c.id === id) || null;
}
