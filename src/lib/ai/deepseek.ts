import OpenAI from "openai";

/**
 * DeepSeek OpenAI-compatible client.
 * Secrets must come from process.env only — never hardcode keys.
 */
export function getDeepSeekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Add it to .env.local or your host secrets (never commit secrets)."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

export function getDefaultModel() {
  // Prefer explicit model. deepseek-chat is the production chat endpoint;
  // set DEEPSEEK_MODEL=deepseek-reasoner or your V4 Pro model id when available.
  return process.env.DEEPSEEK_MODEL || "deepseek-chat";
}

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function completeChat(params: {
  messages: ChatCompletionMessage[];
  temperature?: number;
  maxTokens?: number;
}) {
  const client = getDeepSeekClient();
  const response = await client.chat.completions.create({
    model: getDefaultModel(),
    messages: params.messages,
    temperature: params.temperature ?? 0.4,
    max_tokens: params.maxTokens ?? 4096,
  });

  const choice = response.choices[0]?.message?.content ?? "";
  const usage = response.usage?.total_tokens ?? 0;
  return { content: choice, usage, model: response.model };
}

export async function streamChat(params: {
  messages: ChatCompletionMessage[];
  temperature?: number;
  maxTokens?: number;
}) {
  const client = getDeepSeekClient();
  return client.chat.completions.create({
    model: getDefaultModel(),
    messages: params.messages,
    temperature: params.temperature ?? 0.4,
    max_tokens: params.maxTokens ?? 4096,
    stream: true,
  });
}
