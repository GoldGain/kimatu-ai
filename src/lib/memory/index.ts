/**
 * Memory layers for Kimatu AI
 * - short-term: current conversation window
 * - long-term: durable facts (Supabase later)
 * - rag: embedding search over user docs (pgvector)
 */

export type MemoryItem = {
  id: string;
  content: string;
  kind: "short" | "long" | "rag";
  score?: number;
  metadata?: Record<string, unknown>;
};

const shortTerm = new Map<string, string[]>();

export function pushShortTerm(sessionId: string, content: string, limit = 20) {
  const list = shortTerm.get(sessionId) || [];
  list.push(content);
  while (list.length > limit) list.shift();
  shortTerm.set(sessionId, list);
  return list;
}

export function getShortTerm(sessionId: string) {
  return shortTerm.get(sessionId) || [];
}

/** Naive keyword retrieval placeholder until pgvector is wired */
export function naiveRetrieve(query: string, corpus: string[], k = 3): MemoryItem[] {
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  return corpus
    .map((content, i) => {
      const lower = content.toLowerCase();
      const score = terms.reduce((s, t) => s + (lower.includes(t) ? 1 : 0), 0);
      return {
        id: `mem_${i}`,
        content,
        kind: "rag" as const,
        score,
      };
    })
    .filter((m) => (m.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, k);
}

export function buildMemoryContext(items: MemoryItem[]) {
  if (!items.length) return "";
  return [
    "Relevant memory:",
    ...items.map((m, i) => `${i + 1}. (${m.kind}) ${m.content}`),
  ].join("\n");
}
