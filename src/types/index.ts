export type MessageRole = "user" | "assistant" | "system" | "tool";

export type AgentName =
  | "orchestrator"
  | "planner"
  | "coding"
  | "research"
  | "testing"
  | "deployment";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  agent?: AgentName;
  tokenUsage?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: string;
}

export interface AgentPlanStep {
  id: string;
  title: string;
  agent: AgentName;
  status: "pending" | "running" | "done" | "failed";
  detail?: string;
}

export interface AgentPlan {
  goal: string;
  steps: AgentPlanStep[];
  summary: string;
}

export interface UsageStats {
  conversations: number;
  messages: number;
  tokensUsed: number;
  creditsRemaining: number;
}

export interface StreamChunk {
  type: "token" | "agent" | "plan" | "done" | "error";
  content?: string;
  agent?: AgentName;
  plan?: AgentPlan;
  messageId?: string;
}
