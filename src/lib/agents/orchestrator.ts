import { completeChat, streamChat, type ChatCompletionMessage } from "@/lib/ai/deepseek";
import { AGENT_PROMPTS, detectAgent } from "@/lib/agents/prompts";
import { createId, estimateTokens } from "@/lib/utils";
import type { AgentName, AgentPlan, StreamChunk } from "@/types";

export function buildPlan(goal: string, agent: AgentName): AgentPlan {
  const base = [
    {
      id: createId("step"),
      title: "Clarify goal and constraints",
      agent: "planner" as AgentName,
      status: "done" as const,
    },
    {
      id: createId("step"),
      title: `Execute with ${agent} specialist`,
      agent,
      status: "running" as const,
    },
    {
      id: createId("step"),
      title: "Validate output and next actions",
      agent: "testing" as AgentName,
      status: "pending" as const,
    },
  ];

  return {
    goal,
    summary: `Routed to ${agent} agent with a 3-step execution plan.`,
    steps: base,
  };
}

function historyToMessages(
  system: string,
  history: { role: "user" | "assistant" | "system"; content: string }[]
): ChatCompletionMessage[] {
  return [{ role: "system", content: system }, ...history];
}

/** Offline/demo response when no API key is configured */
export function demoResponse(userMessage: string, agent: AgentName) {
  const plan = buildPlan(userMessage, agent);
  const body = [
    `**Kimatu AI · ${agent} agent** (demo mode)`,
    "",
    `_No DEEPSEEK_API_KEY detected — showing a local scaffold response. Add your key to \`.env.local\` for live DeepSeek replies._`,
    "",
    `### Goal`,
    userMessage,
    "",
    `### Plan`,
    ...plan.steps.map((s, i) => `${i + 1}. **${s.title}** · \`${s.agent}\``),
    "",
    `### Draft answer`,
    agent === "coding"
      ? "I would generate production-ready code modules, file structure, and secure env handling for this request."
      : agent === "research"
        ? "I would gather sources, synthesize findings, and produce a structured brief with recommendations."
        : agent === "testing"
          ? "I would produce a test matrix, edge cases, and regression checklist for the feature."
          : agent === "deployment"
            ? "I would outline env vars, build/deploy steps, health checks, and rollback notes."
            : agent === "planner"
              ? "I would expand this into milestones, owners, risks, and success metrics."
              : "I can chat, plan multi-step work, write code, research topics, design tests, and prepare deployments.",
    "",
    `### Next`,
    "1. Set `DEEPSEEK_API_KEY` in `.env.local`",
    "2. Configure Supabase URL + anon key",
    "3. Restart `npm run dev`",
  ].join("\n");

  return { content: body, plan, agent, usage: estimateTokens(body) };
}

export async function runAgentTurn(params: {
  userMessage: string;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  forceAgent?: AgentName;
  temperature?: number;
}) {
  const agent = params.forceAgent || detectAgent(params.userMessage);
  const plan = buildPlan(params.userMessage, agent);
  const system = AGENT_PROMPTS[agent];

  if (!process.env.DEEPSEEK_API_KEY) {
    return demoResponse(params.userMessage, agent);
  }

  const messages = historyToMessages(system, [
    ...(params.history || []),
    { role: "user", content: params.userMessage },
  ]);

  const result = await completeChat({
    messages,
    temperature: params.temperature,
  });

  return {
    content: result.content,
    plan,
    agent,
    usage: result.usage,
  };
}

export async function* streamAgentTurn(params: {
  userMessage: string;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  forceAgent?: AgentName;
  temperature?: number;
}): AsyncGenerator<StreamChunk> {
  const agent = params.forceAgent || detectAgent(params.userMessage);
  const plan = buildPlan(params.userMessage, agent);
  yield { type: "agent", agent };
  yield { type: "plan", plan };

  if (!process.env.DEEPSEEK_API_KEY) {
    const demo = demoResponse(params.userMessage, agent);
    for (const token of demo.content.split(/(\s+)/)) {
      if (token) yield { type: "token", content: token, agent };
    }
    yield { type: "done", agent, content: demo.content };
    return;
  }

  const system = AGENT_PROMPTS[agent];
  const messages = historyToMessages(system, [
    ...(params.history || []),
    { role: "user", content: params.userMessage },
  ]);

  const stream = await streamChat({
    messages,
    temperature: params.temperature,
  });

  let full = "";
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || "";
    if (token) {
      full += token;
      yield { type: "token", content: token, agent };
    }
  }
  yield { type: "done", agent, content: full };
}
