import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgentTurn, streamAgentTurn } from "@/lib/agents/orchestrator";
import {
  addMessage,
  createConversation,
  getConversation,
} from "@/lib/db/memory-store";
import { pushShortTerm } from "@/lib/memory";
import type { AgentName } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().min(1).max(20000),
  conversationId: z.string().optional(),
  agent: z
    .enum([
      "orchestrator",
      "planner",
      "coding",
      "research",
      "testing",
      "deployment",
    ])
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, agent, temperature, stream } = parsed.data;
    let conversationId = parsed.data.conversationId;
    let conversation = conversationId ? getConversation(conversationId) : null;
    if (!conversation) {
      conversation = createConversation();
      conversationId = conversation.id;
    }

    addMessage(conversationId!, {
      role: "user",
      content: message,
    });
    pushShortTerm(conversationId!, `user: ${message}`);

    const history = conversation.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            let full = "";
            let usedAgent: AgentName = agent || "orchestrator";
            for await (const chunk of streamAgentTurn({
              userMessage: message,
              history,
              forceAgent: agent,
              temperature,
            })) {
              if (chunk.agent) usedAgent = chunk.agent;
              if (chunk.type === "token" && chunk.content) full += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }
            addMessage(conversationId!, {
              role: "assistant",
              content: full,
              agent: usedAgent,
            });
            pushShortTerm(conversationId!, `assistant: ${full}`);
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Stream failed";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", content: msg })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const result = await runAgentTurn({
      userMessage: message,
      history,
      forceAgent: agent,
      temperature,
    });

    addMessage(conversationId!, {
      role: "assistant",
      content: result.content,
      agent: result.agent,
      tokenUsage: result.usage,
    });
    pushShortTerm(conversationId!, `assistant: ${result.content}`);

    const updated = getConversation(conversationId!);
    return NextResponse.json({
      conversation: updated,
      agent: result.agent,
      plan: result.plan,
      usage: result.usage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
