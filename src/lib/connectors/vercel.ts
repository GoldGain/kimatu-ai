export type VercelResult = {
  ok: boolean;
  message: string;
  data?: unknown;
};

function token() {
  return process.env.VERCEL_TOKEN || "";
}

export async function vercelRequest(
  path: string,
  init: RequestInit = {}
): Promise<VercelResult> {
  const t = token();
  if (!t) {
    return {
      ok: false,
      message: "VERCEL_TOKEN is not configured in environment variables.",
    };
  }
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* keep */
  }
  if (!res.ok) {
    return {
      ok: false,
      message: `Vercel API ${res.status}`,
      data,
    };
  }
  return { ok: true, message: "ok", data };
}

export async function listProjects() {
  return vercelRequest("/v9/projects");
}

export async function listDeployments(projectId?: string) {
  const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  return vercelRequest(`/v6/deployments${q}`);
}

export async function getDeployment(id: string) {
  return vercelRequest(`/v13/deployments/${id}`);
}
