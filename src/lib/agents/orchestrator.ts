import { completeChat, streamChat, type ChatCompletionMessage } from "@/lib/ai/deepseek";
import { AGENT_PROMPTS, detectAgent } from "@/lib/agents/prompts";
import { createId } from "@/lib/utils";
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
    throw new Error(
      "DEEPSEEK_API_KEY is required for production. Configure it in environment variables."
    );
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
    yield {
      type: "error",
      content:
        "DEEPSEEK_API_KEY is required for production. Configure it in environment variables.",
      agent,
    };
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
