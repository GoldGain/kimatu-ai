export type GithubResult = {
  ok: boolean;
  message: string;
  data?: unknown;
};

function token() {
  return process.env.GITHUB_TOKEN || "";
}

export async function githubRequest(
  path: string,
  init: RequestInit = {}
): Promise<GithubResult> {
  const t = token();
  if (!t) {
    return {
      ok: false,
      message: "GITHUB_TOKEN is not configured in environment variables.",
    };
  }
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${t}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* keep text */
  }
  if (!res.ok) {
    return {
      ok: false,
      message: `GitHub API ${res.status}: ${typeof data === "object" && data && "message" in data ? (data as { message: string }).message : text}`,
      data,
    };
  }
  return { ok: true, message: "ok", data };
}

export async function listRepos() {
  return githubRequest("/user/repos?per_page=30&sort=updated");
}

export async function createRepo(name: string, description = "", isPrivate = false) {
  return githubRequest("/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });
}

export async function getFile(owner: string, repo: string, path: string) {
  return githubRequest(`/repos/${owner}/${repo}/contents/${path}`);
}

export async function putFile(params: {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
  sha?: string;
}) {
  const body: Record<string, string> = {
    message: params.message,
    content: Buffer.from(params.content, "utf8").toString("base64"),
  };
  if (params.branch) body.branch = params.branch;
  if (params.sha) body.sha = params.sha;
  return githubRequest(
    `/repos/${params.owner}/${params.repo}/contents/${params.path}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  fromSha: string
) {
  return githubRequest(`/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: fromSha }),
  });
}

export async function createPullRequest(params: {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
}) {
  return githubRequest(`/repos/${params.owner}/${params.repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: params.title,
      head: params.head,
      base: params.base,
      body: params.body || "",
    }),
  });
}
