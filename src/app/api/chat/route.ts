import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgentTurn, streamAgentTurn } from "@/lib/agents/orchestrator";
import {
  addMessage,
  createConversation,
  getConversation,
  recordUsage,
} from "@/lib/db/repository";
import { assertProductionConfig } from "@/lib/db/supabase";
import { pushShortTerm } from "@/lib/memory";
import type { AgentName } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string().min(1).max(20000),
  conversationId: z.string().uuid().optional(),
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
    assertProductionConfig();

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
    let conversation = conversationId
      ? await getConversation(conversationId)
      : null;
    if (!conversation) {
      conversation = await createConversation();
      conversationId = conversation.id;
    }

    await addMessage(conversationId!, {
      role: "user",
      content: message,
    });
    pushShortTerm(conversationId!, `user: ${message}`);

    // Reload after user message so history is complete
    conversation = await getConversation(conversationId!);
    const history = (conversation?.messages || [])
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
              if (chunk.type === "error") {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
                controller.close();
                return;
              }
              if (chunk.agent) usedAgent = chunk.agent;
              if (chunk.type === "token" && chunk.content) full += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }
            await addMessage(conversationId!, {
              role: "assistant",
              content: full,
              agent: usedAgent,
            });
            pushShortTerm(conversationId!, `assistant: ${full}`);
            await recordUsage("chat_stream", Math.ceil(full.length / 4));
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

    await addMessage(conversationId!, {
      role: "assistant",
      content: result.content,
      agent: result.agent,
      tokenUsage: result.usage,
    });
    pushShortTerm(conversationId!, `assistant: ${result.content}`);
    await recordUsage("chat", result.usage);

    const updated = await getConversation(conversationId!);
    return NextResponse.json({
      conversation: updated,
      agent: result.agent,
      plan: result.plan,
      usage: result.usage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Chat failed";
    const status = /DEEPSEEK_API_KEY|Production config|Supabase/.test(msg)
      ? 503
      : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
