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
  run(action: string, input?: Record<string, unknown>, ctx?: ConnectorContext): Promise<ConnectorResult>;
}

function missingEnv(names: string[]) {
  return names.filter((n) => !process.env[n]);
}

export const githubConnector: Connector = {
  id: "github",
  name: "GitHub Connector",
  description: "List repos and manage code via GitHub API.",
  isConfigured: () => Boolean(process.env.GITHUB_TOKEN),
  async run(action) {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message:
          "GITHUB_TOKEN is not configured. Add a fine-scoped PAT in env vars (do not paste tokens in chat).",
      };
    }
    return {
      ok: true,
      message: `GitHub action '${action}' acknowledged (wire Octokit for production).`,
      data: { action },
    };
  },
};

export const supabaseConnector: Connector = {
  id: "supabase",
  name: "Supabase Connector",
  description: "Database and auth operations via Supabase.",
  isConfigured: () =>
    missingEnv(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]).length === 0,
  async run(action) {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and ANON key.",
      };
    }
    return {
      ok: true,
      message: `Supabase action '${action}' ready.`,
      data: { action },
    };
  },
};

export const vercelConnector: Connector = {
  id: "vercel",
  name: "Vercel Connector",
  description: "Deploy applications to Vercel.",
  isConfigured: () => Boolean(process.env.VERCEL_TOKEN),
  async run(action) {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: "VERCEL_TOKEN is not configured.",
      };
    }
    return {
      ok: true,
      message: `Vercel action '${action}' acknowledged.`,
      data: { action },
    };
  },
};

export const filesystemConnector: Connector = {
  id: "filesystem",
  name: "File System",
  description: "Virtual project file operations in Kimatu workspace.",
  isConfigured: () => true,
  async run(action, input) {
    return {
      ok: true,
      message: `Filesystem '${action}' on ${input?.path || "/"}`,
      data: input,
    };
  },
};

export const pdfConnector: Connector = {
  id: "pdf",
  name: "PDF Analyzer",
  description: "Extract text and summarize PDF documents.",
  isConfigured: () => true,
  async run(action) {
    return {
      ok: true,
      message: `PDF '${action}' stub — plug pdf parser in production.`,
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
